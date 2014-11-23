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

    def table
      table_name = params['table_name']
      model = table_name.classify.constantize

      data = model.all
      columns = data.columns
      cols = []
      columns.each do |col|
        hash = {}
        hash[:dbTableName] = col.name
        hash[:dbFieldName] = col.name
        hash[:title] = col.name
        hash[:valueType] = col.type
        hash[:width] = 100
        cols.append(hash)
      end

      return_hash = {}
      return_hash[:columns] = cols
      return_hash[:rows] = data
      render json:return_hash
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
