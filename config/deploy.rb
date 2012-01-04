set :stages, %w(staging)
set :default_stage, "staging"

set :application, "contiki_pinme2"
set :user, "contiki_pinme2"

set :deploy_to,   "/home/#{user}/#{application}"

begin
  require 'capistrano/ext/multistage'
rescue LoadError
  abort "Could not load capistrano multistage extension.  Make sure you have installed the capistrano-ext gem"
end

require 'bundler/capistrano'

default_run_options[:pty] = true

set :scm, :git
set :repository, "git@github.com:layam/google_maps_pano_proto.git"
set :ssh_options, { :forward_agent => true }
set :deploy_via, :remote_cache

set :use_sudo, false

namespace :deploy do

  after "deploy:setup", "deploy:initial_setup"
  task :initial_setup do
    run "mkdir -p #{shared_path}/config"
    #put File.read(File.join(File.expand_path(File.dirname(__FILE__)), "application.yml")), "#{shared_path}/config/application.yml", :mode => 0600
  end

  after "deploy:setup", "deploy:create_asset_dirs"
  task :create_asset_dirs do
    run "mkdir -p #{shared_path}/assets"
  end

  after "deploy:finalize_update", "deploy:symlink_configs"
  task :symlink_configs do
   # run "ln -fs #{shared_path}/config/database.yml #{latest_release}/config/database.yml"
   #run "ln -fs #{shared_path}/config/application.yml #{latest_release}/config/application.yml"
   run "rm -rf #{latest_release}/public/assets && ln -s #{shared_path}/assets #{latest_release}/public/assets"
  end

  #after "deploy:symlink", "deploy:flush_memcached"
  #desc "Flush memcached"
  #task :flush_memcached do
  #  run "cd #{current_path} && rake RAILS_ENV=#{rails_env} ubxd_web:flush_memcached"
  #end

  # Clean up old releases (by default keeps last 5)
  after "deploy:update_code", "deploy:cleanup"

  task :start do
  end

  desc "Restart the app"
  task :restart do
    run "touch #{current_release}/tmp/restart.txt"
  end

  task :stop do
  end

  namespace :web do
  
    before "deploy", "deploy:web:disable"
    before "deploy:migrations", "deploy:web:disable"
  
    #desc "Present a maintenance page to visitors."
    #task :disable, :roles => :web, :except => { :no_release => true } do
    #  on_rollback { run "rm #{shared_path}/system/maintenance.html" }
    #
    #  run "cp #{current_path}/public/maintenance/maintenance.html #{shared_path}/system/"
    #end
  
    after "deploy", "deploy:web:enable"
    after "deploy:migrations", "deploy:web:enable"
    # Default web:enable task is fine
  
  end

  #after "deploy",            "deploy:notify_airbrake"
  #after "deploy:migrations", "deploy:notify_airbrake"
  #
  #desc "Notify Airbrake of the deployment"
  #task :notify_airbrake, :except => { :no_release => true }, :roles => :db, :only => { :primary => true } do
  #  local_user = ENV['USER'] || ENV['USERNAME']
  #
  #  # Added because the REVISION file contains the Tag as well as the revision number
  #  revision_number = current_revision.split($/).first.chomp
  #
  #  notify_command = "rake RAILS_ENV=#{rails_env} airbrake:deploy TO=#{rails_env} REVISION=#{revision_number} REPO=#{repository} USER=#{local_user}"
  #  puts "Notifying Airbrake of Deploy (#{notify_command})"
  #  run "cd #{current_path} && #{notify_command}"
  #  puts "Airbrake Notification Complete."
  #end
end