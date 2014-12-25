require_dependency "active_record_visualize/application_controller"

module ActiveRecordVisualize
  class ViewerController < ApplicationController
    def show
      #render json:{a:"123"}
      @all_models = all_models
      render :show
    end

    def all_models
      models = get_all_models
      return_models = models.reject do |model|
        model.to_s.eql?('ActiveRecord::SchemaMigration')
      end
      return_model_names = return_models.map { |model| model.to_s}
    end

    def get_all_models
      #Since Rails doesn't load classes unless it needs them, you must read the models from the folder. Here is the code
      Dir[Rails.root.to_s + '/app/models/**/*.rb'].each do |file|
        begin
          require file
        rescue
        end
      end
      models = ActiveRecord::Base.descendants
    end

    def get_table_by_page
      page_index = params[:page_index].to_i
      page_size = params[:page_size].to_i
      table_name = params[:table_name]
      condition = params[:condition]
      #ActionController::Parameters.permit_all_parameters = true
      model = get_model_const(table_name)
      if(condition)
        condition = condition.permit(model.column_names)
        data = model.where(condition).limit(page_size.to_i).offset(page_index*page_size)
      else
        data = model.all.limit(page_size.to_i).offset(page_index*page_size)
      end

      return_hash = {}
      return_hash[:rows] = data
      return_hash[:page_index] = page_index
      render json:return_hash
    end

    def get_table_hash(table_name, id, condition, page_index)
      page_size = params['page_size'].to_i
      model = get_model_const(table_name)

      id = id.to_s
      if(id && id.is_a?(String) && !id.empty?)
        data = [model.find(id)]
        node_name = "#{table_name}_#{id}"
      else
        if(condition)
          total_num = model.where(condition).count
          data = model.where(condition).limit(page_size.to_i).offset(page_index*page_size)
          node_name = "#{table_name}s_foreign_#{condition.keys[0]}"
        else
          total_num = model.all.count
          data = model.all.limit(page_size.to_i).offset(page_index*page_size)
          node_name = "#{table_name}s"
        end

        page_num = total_num / page_size
        if(total_num % page_size != 0)
          page_num = page_num + 1
        end

        collection = true
      end

      columns = model.columns
      cols = []
      columns.each do |col|
        hash = {}
        hash[:dbTableName] = col.name
        hash[:dbFieldName] = col.name
        hash[:title] = col.name
        hash[:valueType] = col.type
        hash[:width] = 50
        if(col.name.include?('name') || col.name.include?('id') || col.name.include?('status'))
          cols.append(hash)
        end
      end

      return_hash = {}
      return_hash[:columns] = cols
      return_hash[:rows] = data
      return_hash[:node_name] = node_name
      return_hash[:table_name] = table_name
      return_hash[:collection] = collection
      return_hash[:condition] = condition
      return_hash[:page_size] = page_size
      return_hash[:page_num] = page_num
      return_hash[:page_index] = page_index
      return_hash
    end

    def relation
      table_name = params['table_name']
      id = params['id']
      page_size = params['page_size'].to_i

      @return_hash = {}
      @return_nodes = []
      @return_links = []
      @nodes_hash = {}
      @links_hash = {}
      @all_node_name_stack = []

      get_relation_recursive(nil, table_name, id, nil, nil)

      @return_hash['nodes'] = @return_nodes
      @return_hash['links'] = @return_links
      render json:@return_hash
    end

    def get_model_const(table_name)
      model = table_name.classify.constantize
    end

    def get_relation_recursive(macro, table_name, id, foreign_key, foreign_id)
      model = get_model_const(table_name)

      condition = {}
      condition[foreign_key] = foreign_id
      row_hash = get_table_hash(table_name, id, condition, 0)
      node_name = row_hash[:node_name]

      if(@nodes_hash[node_name].nil?)
        row_hash[:level] = @all_node_name_stack.size
        row_hash[:index] = @return_nodes.size
        @nodes_hash[node_name] = row_hash
        @return_nodes.push(row_hash)
      end

      node = @nodes_hash[node_name]
      if(@all_node_name_stack.size > 0)
        @last_node_name = @all_node_name_stack.last
        last_node = @nodes_hash[@last_node_name]
        if(macro == :belongs_to)
          rel_column = foreign_key
        elsif(macro == :has_one)
          rel_column = foreign_key
        elsif(macro == :has_many)
          rel_column = 'collection'
        end
        key = "#{@last_node_name}~#{node_name}"
        if(@links_hash[key].nil?)
          link = {start:@last_node_name, end:node_name, relation:macro, rel_column:rel_column}
          @links_hash[key] = link
          @return_links.push link
        end
      end

      if(id)
        @all_node_name_stack.push(node_name)
        row = model.find(id)
        model.reflections.each do |key, association|
          foreign_key = association.foreign_key
          macro = association.macro
          name = association.name

          if(macro == :belongs_to)
            assoc_id = row.send foreign_key.to_sym
            get_relation_recursive(macro, name.to_s, assoc_id, foreign_key, nil)
          end

          if(macro == :has_one)
            assoc_id = row.send foreign_key.to_sym
            get_relation_recursive(macro, name.to_s, assoc_id, foreign_key, nil)
          end

          if(macro == :has_many && association.options[:through].nil?)
            map = Hash[ActiveRecord::Base.send(:descendants).collect{|c| [c.table_name, c.name]}]
            get_relation_recursive(macro, map[name.to_s], nil, foreign_key, id)
          end
        end

        @all_node_name_stack.pop()


      else
        #@last_node_name = nil
      end

    end

    def table
      table_name = params['table_name']
      id = params['id']

      page_index = params[:page_index].to_i
      page_size = params[:page_size].to_i
      condition = params[:condition]

      return_hash = get_table_hash(table_name, id, condition, page_index)
      return_hash[:level] = 0
      return_hash[:index] = 0

      @return_hash = {}
      @return_hash['nodes'] = [return_hash]
      @return_hash['links'] = []
      render json:@return_hash
      return

      #data = Project.all
      #data = Account.select('accounts.name, users.email').joins(:users)

      j = data.to_json

      data.each do |row|
        t = row.id
        c = row.class
        t = c
      end

      data.reflect_on_all_associations.collect{ |association|
        association.name.to_s.classify
      }

      Project.reflections.each do |key, association|
        table_name = association.table_name
        foreign_key = association.foreign_key
        macro = association.macro
        tm = macro
      end



      render json:return_hash
    end
  end
end
