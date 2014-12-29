require 'rails_helper'

module ActiveRecordVisualize
  RSpec.describe ViewerController, :type => :controller do
    #fix for engine route not included by rspec
    routes { ActiveRecordVisualize::Engine.routes }
    #fix for jbuilder template doesn't render
    render_views

    before(:all) do
      #@account = FactoryGirl.create(:account, name: 'account1',  description: 'account1')

    end
    it 'return 200 get enterprise list' do
      #account = @account

      get(:show)
      expect(response).to have_http_status(200)
      expect(response).to render_template(:show)
    end
  end

end