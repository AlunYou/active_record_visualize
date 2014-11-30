
ActiveRecordVisualize::Engine.routes.draw do
  root to: "rules#index"

  get 'viewer' => 'viewer#show'
  get 'table' => 'viewer#table'

  get 'get_relations' => 'viewer#get_relations'

end

Rails.application.routes.draw do
  mount ActiveRecordVisualize::Engine => ActiveRecordVisualize.mounted_at
end
