## Resource Files

If you want to include resource files in your Backk microservice build, create a `resources`
directory in you Backk microservice project. That directory is copied to `build` directory
whenever you build/start your microservice. Resources are included in the final Docker image.

You can access your resources from your microservice easily using [File Reading](../api/FILE_READING.MD) methods.
