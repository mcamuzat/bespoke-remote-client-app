namespace :gulp do

	desc 'gulp build'
	task :build do
	    on roles(:all) do
	    	run_locally do
	    		execute :gulp, :build
	    	end
	    end
	end

end