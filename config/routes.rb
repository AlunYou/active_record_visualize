
ActiveRecordVisualize::Engine.routes.draw do
  root to: "rules#index"

  get 'viewer' => 'viewer#show'
  get 'table' => 'viewer#table'

  get 'relation' => 'viewer#relation'
  get 'get_table_by_page' => 'viewer#get_table_by_page'

end

Rails.application.routes.draw do
  mount ActiveRecordVisualize::Engine => ActiveRecordVisualize.mounted_at
end
