set :rails_env, "production"

set :app_server, "stage1.unboxedconsulting.com"

role :app, app_server
role :web, app_server
role :db,  app_server, :primary => true

if ENV['BRANCH'].nil?
  set :branch, "master"
else
  set :branch, "#{ENV['BRANCH']}"
end
