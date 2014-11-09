require_dependency "active_record_visualize/application_controller"

module ActiveRecordVisualize
  class ViewerController < ApplicationController
    def show
      render json:{a:"123"}
    end
  end
end
