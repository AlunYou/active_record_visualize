
ActiveRecordVisualize::Engine.routes.draw do

  get 'table' => 'viewer#table'
  get 'relation' => 'viewer#relation'

  get 'get_table_by_page' => 'viewer#get_table_by_page'

  root to: 'viewer#show'
  get '*path' => 'viewer#show'

end

Rails.application.routes.draw do
  mount ActiveRecordVisualize::Engine => ActiveRecordVisualize.mounted_at
end
