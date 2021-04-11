"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typedoc_pksilen_1 = require("typedoc-pksilen");
function generateServicesDocumentation() {
    var _a;
    const app = new typedoc_pksilen_1.Application();
    app.options.addReader(new typedoc_pksilen_1.TSConfigReader());
    app.options.addReader(new typedoc_pksilen_1.TypeDocReader());
    app.bootstrap({
        exclude: ['**/*Impl.ts']
    });
    const project = app.convert(app.expandInputFiles(['src/services']));
    if (project) {
        (_a = project.children) === null || _a === void 0 ? void 0 : _a.forEach((module) => {
            var _a;
            if (module.kind === 1) {
                (_a = module.children) === null || _a === void 0 ? void 0 : _a.forEach((possibleClass) => {
                    var _a;
                    if (possibleClass.kind === 128) {
                        (_a = possibleClass.children) === null || _a === void 0 ? void 0 : _a.forEach((possibleProperty) => {
                            if (possibleProperty.kind === 1024) {
                                if (possibleProperty.decorators) {
                                    const decorators = possibleProperty.decorators
                                        .filter((decorator) => decorator.name !== 'TestValue' && decorator.name !== 'TestValueType')
                                        .map((decorator) => {
                                        const hasDecoratorArgumens = Object.keys(decorator.arguments).length > 0;
                                        return (decorator.name +
                                            '(' +
                                            (hasDecoratorArgumens ? JSON.stringify(decorator.arguments) : '') +
                                            ')');
                                    });
                                    possibleProperty.comment = new typedoc_pksilen_1.Comment(decorators.join('\n'));
                                }
                            }
                        });
                    }
                });
            }
        });
        const outputDir = 'docs';
        app.generateDocs(project, outputDir);
    }
}
exports.default = generateServicesDocumentation;
//# sourceMappingURL=generateServicesDocumentation.js.map