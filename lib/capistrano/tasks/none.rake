# -*- mode: ruby -*-

namespace :none do
  desc 'Check if local "repo" exists & is a directory'
  task :check do
    unless File.directory?(repo_url)
      raise "none.rake: #{repo_url} must be a directory!"
    end
  end

  desc 'Upload files'
  task :create_release do
    on roles :all do
      info 'Uploading files for release'
      upload! repo_url, release_path, recursive: true
    end
  end

  desc 'set current version'
  task :set_current_revision do
    on roles :all do
      run_locally do
        rev = capture(:git, 'rev-parse', 'HEAD')
        set :current_revision, rev
      end
    end
  end
end