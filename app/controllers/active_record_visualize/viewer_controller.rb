require_dependency "active_record_visualize/application_controller"

module ActiveRecordVisualize
  class ViewerController < ApplicationController

    before_action :read_write_cookie

    private
    def read_write_cookie
      hash = {
              mounted_at: ActiveRecordVisualize.mounted_at,
              layouter: ActiveRecordVisualize.layouter,
              simple_table_page_size: ActiveRecordVisualize.simple_table_page_size,
              object_table_column_num: ActiveRecordVisualize.object_table_column_num,
              auto_fit: ActiveRecordVisualize.auto_fit
      }
      if(cookies[:active_record_visualize].nil?)
        cookies[:active_record_visualize] = hash.to_json
      end
    end

    public
    def show
      @all_models = all_models
      render :show
    end

    def table
      model_name = params[:model_name]
      page_index = params[:page_index].to_i
      page_size = params[:page_size].to_i
      condition = params[:condition]
      model = model_name.constantize
      if(condition && condition.respond_to?(:permit))
        condition = condition.permit(model.column_names)
      end

      return_hash = get_table_hash(model, nil, condition, page_index, page_size)
      return_hash[:level] = 0
      return_hash[:index] = 0

      @return_hash = {}
      @return_hash['nodes'] = [return_hash]
      @return_hash['links'] = []
      render json:@return_hash
      return
    end

    def relation
      model_name = params[:model_name]
      id = params[:id]
      page_size = params[:page_size].to_i

      @return_hash = {}
      @return_nodes = []
      @return_links = []
      @nodes_hash = {}
      @links_hash = {}
      @all_node_name_stack = []

      model = model_name.constantize
      get_relation_recursive(nil, model, id, nil, nil, page_size)

      @return_hash['nodes'] = @return_nodes
      @return_hash['links'] = @return_links
      hash = @return_hash.to_json
      render json:hash
    end

    private
    def all_models
      models = get_all_models
      return_models = models.reject do |model|
        model.to_s.eql?('ActiveRecord::SchemaMigration') || model.to_s.eql?('WiceGridSerializedQuery') || model.to_s.include?('Routefilter::') || model.to_s.include?('PaperTrail::')
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

    def get_model_const(table_name)
      model = table_name.classify.constantize
    end

    def get_table_hash(model, id, condition, page_index, page_size)
      table_name = model.table_name

      columns = model.columns
      column_name = []
      cols = []
      columns.each do |col|
        hash = {}
        hash[:dbTableName] = col.name
        hash[:dbFieldName] = col.name
        hash[:title] = col.name
        hash[:valueType] = col.type
        hash[:width] = 50
        #if(col.name.include?('name') || col.name.include?('id') || col.name.include?('status'))
        if(col.type != :binary)
          cols.append(hash)
          column_name.push(col.name)
        else
          v = 4
        end
      end

      id = id.to_s
      if(id && id.is_a?(String) && !id.empty?)
        data = model.select(column_name).where('id = ?', id)
        node_name = "#{table_name}_#{id}"
        node_display_name = "#{table_name} (id=#{id})"
      else
        if(condition && condition.respond_to?(:keys))
          total_num = model.where(condition).count
          data = model.select(column_name).where(condition).limit(page_size.to_i).offset(page_index*page_size)
          node_name = "#{table_name}_foreign_#{condition.keys[0]}"
          node_display_name = "#{table_name} (#{condition.keys[0]} = #{condition.values[0]})"
        else
          total_num = model.all.count
          data = model.all.select(column_name).limit(page_size.to_i).offset(page_index*page_size)
          node_name = "#{table_name}"
          node_display_name = "#{table_name} (All)"
        end

        page_num = total_num / page_size
        if(total_num % page_size != 0)
          page_num = page_num + 1
        end
        collection = true
      end

      return_hash = {}
      return_hash[:columns] = cols
      return_hash[:rows] = data
      return_hash[:node_name] = node_name
      return_hash[:node_display_name] = node_display_name
      return_hash[:model_name] = model.name
      return_hash[:collection] = collection
      return_hash[:condition] = condition
      return_hash[:page_size] = page_size
      return_hash[:page_num] = page_num
      return_hash[:page_index] = page_index
      return_hash
    end

    def get_relation_recursive(macro, model, id, foreign_key, foreign_id, page_size)
      if(foreign_key && foreign_id)
        condition = {}
        condition[foreign_key] = foreign_id
      end
      row_hash = get_table_hash(model, id, condition, 0, page_size)
      node_name = row_hash[:node_name]

      newly_insert_node = false
      if(@nodes_hash[node_name].nil?)
        row_hash[:level] = @all_node_name_stack.size
        row_hash[:index] = @return_nodes.size
        @nodes_hash[node_name] = row_hash
        @return_nodes.push(row_hash)
        newly_insert_node = true
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

      if(newly_insert_node && id)
        @all_node_name_stack.push(node_name)
        row = model.find(id)
        model.reflections.each do |key, association|
          foreign_key = association.foreign_key
          macro = association.macro
          name = association.name
          begin
            recursive_model = get_model_const(name.to_s)
          rescue => e
            Rails.logger.debug("error parsing model from association name: #{e}");
            recursive_model = nil
          end

          if(!recursive_model.nil?)
            if(macro == :belongs_to)
              assoc_id = row.send foreign_key.to_sym
              get_relation_recursive(macro, recursive_model, assoc_id, foreign_key, nil, page_size)
            end

            if(macro == :has_one)
              assoc_id = row.send foreign_key.to_sym
              get_relation_recursive(macro, recursive_model, assoc_id, foreign_key, nil, page_size)
            end

            if(macro == :has_many && association.options[:through].nil? && !(name == :versions))
              map = Hash[ActiveRecord::Base.send(:descendants).collect{|c| [c.table_name, c]}]
              get_relation_recursive(macro, map[name.to_s], nil, foreign_key, id, page_size)
            end
          end
        end

        @all_node_name_stack.pop()
      else
        #@last_node_name = nil
      end
    end

  end
end
