import { Application, Comment, TSConfigReader, TypeDocReader } from 'typedoc-pksilen';

(function generateServicesDocumentation() {
  const app = new Application();
  app.options.addReader(new TSConfigReader());
  app.options.addReader(new TypeDocReader());
  app.bootstrap({
    exclude: ['node_modules/**/*', '**/*Impl.ts'],
    ignoreCompilerErrors: true
  });

  const project = app.convert(app.expandInputFiles(['src/services']));

  if (project) {
    project.children?.forEach((module) => {
      if (module.kind === 1) {
        module.children?.forEach((possibleClass) => {
          if (possibleClass.kind === 128) {
            possibleClass.children?.forEach((possibleProperty) => {
              if (possibleProperty.kind === 1024) {
                if (possibleProperty.decorators) {
                  const decorators = possibleProperty.decorators
                    .filter(
                      (decorator) => decorator.name !== 'TestValue'
                    )
                    .map((decorator) => {
                      const hasDecoratorArguments = Object.keys(decorator.arguments).length > 0;
                      return (
                        decorator.name +
                        '(' +
                        (hasDecoratorArguments ? JSON.stringify(decorator.arguments) : '') +
                        ')'
                      );
                    });
                  possibleProperty.comment = new Comment(decorators.join('\n'));
                }
              }
            });
          }
        });
      }
    });

    app.generateDocs(project, 'docs');
  }
})();
