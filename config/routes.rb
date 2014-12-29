
ActiveRecordVisualize::Engine.routes.draw do

  get 'table' => 'viewer#table'
  get 'relation' => 'viewer#relation'

  root to: 'viewer#show'
  get '*path' => 'viewer#show'

end

Rails.application.routes.draw do
  mount ActiveRecordVisualize::Engine => ActiveRecordVisualize.mounted_at
end
