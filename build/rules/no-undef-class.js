'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _core = require('../core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  meta: {
    docs: {
      description: 'Checks that you are using the existent css/scss/less classes',
      recommended: true
    },
    schema: [{
      type: 'object',
      properties: {
        camelCase: { enum: [true, 'dashes', 'only', 'dashes-only'] }
      }
    }]
  },
  create: function create(context) {
    var camelCase = _lodash2.default.get(context, 'options[0].camelCase');
    var syntaxName = _lodash2.default.get(context, 'options[0].syntax');

    /*
       maps variable name to property Object
       map = {
         [variableName]: {
           classesMap: { foo: 'foo', fooBar: 'foo-bar', 'foo-bar': 'foo-bar' },
           node: {...}
         }
       }
        example:
       import s from './foo.scss';
       s is variable name
        property Object has two keys
       1. classesMap: an object with propertyName as key and its className as value
       2. node: node that correspond to s (see example above)
     */
    var map = {};

    return {
      ImportDeclaration: function ImportDeclaration(node) {
        var styleImportNodeData = (0, _core.getStyleImportNodeData)(node);

        if (!styleImportNodeData) {
          return;
        }

        var importName = styleImportNodeData.importName,
            styleFilePath = styleImportNodeData.styleFilePath,
            importNode = styleImportNodeData.importNode;


        var styleFileAbsolutePath = (0, _core.getFilePath)(context, styleFilePath);
        var classesMap = {};
        var exportPropsMap = {};

        if ((0, _core.fileExists)(styleFileAbsolutePath)) {
          var ast = (0, _core.getAST)(styleFileAbsolutePath, syntaxName);
          var classes = ast && (0, _core.getStyleClasses)(ast);

          classesMap = classes && (0, _core.getClassesMap)(classes, camelCase);
          exportPropsMap = ast && (0, _core.getExportPropsMap)(ast);
        }

        // this will be used to check if classes are defined
        _lodash2.default.set(map, importName + '.classesMap', classesMap);

        // this will be used to check if :export properties are defined
        _lodash2.default.set(map, importName + '.exportPropsMap', exportPropsMap);

        // save node for reporting unused styles
        _lodash2.default.set(map, importName + '.node', importNode);
      },

      MemberExpression: function MemberExpression(node) {
        /*
           Check if property exists in css/scss file as class
         */

        var objectName = node.object.name;

        var propertyName = (0, _core.getPropertyName)(node, camelCase);

        if (!propertyName) {
          return;
        }

        var classesMap = _lodash2.default.get(map, objectName + '.classesMap');
        var exportPropsMap = _lodash2.default.get(map, objectName + '.exportPropsMap');

        if (classesMap && classesMap[propertyName] == null && exportPropsMap && exportPropsMap[propertyName] == null) {
          context.report(node.property, 'Class or exported property \'' + propertyName + '\' not found');
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9ydWxlcy9uby11bmRlZi1jbGFzcy5qcyJdLCJuYW1lcyI6WyJtZXRhIiwiZG9jcyIsImRlc2NyaXB0aW9uIiwicmVjb21tZW5kZWQiLCJzY2hlbWEiLCJ0eXBlIiwicHJvcGVydGllcyIsImNhbWVsQ2FzZSIsImVudW0iLCJjcmVhdGUiLCJjb250ZXh0IiwiXyIsImdldCIsInN5bnRheE5hbWUiLCJtYXAiLCJJbXBvcnREZWNsYXJhdGlvbiIsIm5vZGUiLCJzdHlsZUltcG9ydE5vZGVEYXRhIiwiaW1wb3J0TmFtZSIsInN0eWxlRmlsZVBhdGgiLCJpbXBvcnROb2RlIiwic3R5bGVGaWxlQWJzb2x1dGVQYXRoIiwiY2xhc3Nlc01hcCIsImV4cG9ydFByb3BzTWFwIiwiYXN0IiwiY2xhc3NlcyIsInNldCIsIk1lbWJlckV4cHJlc3Npb24iLCJvYmplY3ROYW1lIiwib2JqZWN0IiwibmFtZSIsInByb3BlcnR5TmFtZSIsInJlcG9ydCIsInByb3BlcnR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7OztBQUVBOzs7O2tCQWFlO0FBQ2JBLFFBQU07QUFDSkMsVUFBTTtBQUNKQyxtQkFBYSw4REFEVDtBQUVKQyxtQkFBYTtBQUZULEtBREY7QUFLSkMsWUFBUSxDQUNOO0FBQ0VDLFlBQU0sUUFEUjtBQUVFQyxrQkFBWTtBQUNWQyxtQkFBVyxFQUFFQyxNQUFNLENBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsTUFBakIsRUFBeUIsYUFBekIsQ0FBUjtBQUREO0FBRmQsS0FETTtBQUxKLEdBRE87QUFlYkMsUUFmYSxrQkFlTEMsT0FmSyxFQWVZO0FBQ3ZCLFFBQU1ILFlBQVlJLGlCQUFFQyxHQUFGLENBQU1GLE9BQU4sRUFBZSxzQkFBZixDQUFsQjtBQUNBLFFBQU1HLGFBQWFGLGlCQUFFQyxHQUFGLENBQU1GLE9BQU4sRUFBZSxtQkFBZixDQUFuQjs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBLFFBQU1JLE1BQU0sRUFBWjs7QUFFQSxXQUFPO0FBQ0xDLHVCQURLLDZCQUNjQyxJQURkLEVBQzRCO0FBQy9CLFlBQU1DLHNCQUFzQixrQ0FBdUJELElBQXZCLENBQTVCOztBQUVBLFlBQUksQ0FBQ0MsbUJBQUwsRUFBMEI7QUFDeEI7QUFDRDs7QUFMOEIsWUFRN0JDLFVBUjZCLEdBVzNCRCxtQkFYMkIsQ0FRN0JDLFVBUjZCO0FBQUEsWUFTN0JDLGFBVDZCLEdBVzNCRixtQkFYMkIsQ0FTN0JFLGFBVDZCO0FBQUEsWUFVN0JDLFVBVjZCLEdBVzNCSCxtQkFYMkIsQ0FVN0JHLFVBVjZCOzs7QUFhL0IsWUFBTUMsd0JBQXdCLHVCQUFZWCxPQUFaLEVBQXFCUyxhQUFyQixDQUE5QjtBQUNBLFlBQUlHLGFBQWEsRUFBakI7QUFDQSxZQUFJQyxpQkFBaUIsRUFBckI7O0FBRUEsWUFBSSxzQkFBV0YscUJBQVgsQ0FBSixFQUF1QztBQUNyQyxjQUFNRyxNQUFNLGtCQUFPSCxxQkFBUCxFQUE4QlIsVUFBOUIsQ0FBWjtBQUNBLGNBQU1ZLFVBQVVELE9BQU8sMkJBQWdCQSxHQUFoQixDQUF2Qjs7QUFFQUYsdUJBQWFHLFdBQVcseUJBQWNBLE9BQWQsRUFBdUJsQixTQUF2QixDQUF4QjtBQUNBZ0IsMkJBQWlCQyxPQUFPLDZCQUFrQkEsR0FBbEIsQ0FBeEI7QUFDRDs7QUFFRDtBQUNBYix5QkFBRWUsR0FBRixDQUFNWixHQUFOLEVBQWNJLFVBQWQsa0JBQXVDSSxVQUF2Qzs7QUFFQTtBQUNBWCx5QkFBRWUsR0FBRixDQUFNWixHQUFOLEVBQWNJLFVBQWQsc0JBQTJDSyxjQUEzQzs7QUFFQTtBQUNBWix5QkFBRWUsR0FBRixDQUFNWixHQUFOLEVBQWNJLFVBQWQsWUFBaUNFLFVBQWpDO0FBQ0QsT0FsQ0k7O0FBbUNMTyx3QkFBa0IsMEJBQUNYLElBQUQsRUFBa0I7QUFDbEM7Ozs7QUFJQSxZQUFNWSxhQUFhWixLQUFLYSxNQUFMLENBQVlDLElBQS9COztBQUVBLFlBQU1DLGVBQWUsMkJBQWdCZixJQUFoQixFQUFzQlQsU0FBdEIsQ0FBckI7O0FBRUEsWUFBSSxDQUFDd0IsWUFBTCxFQUFtQjtBQUNqQjtBQUNEOztBQUVELFlBQU1ULGFBQWFYLGlCQUFFQyxHQUFGLENBQU1FLEdBQU4sRUFBY2MsVUFBZCxpQkFBbkI7QUFDQSxZQUFNTCxpQkFBaUJaLGlCQUFFQyxHQUFGLENBQU1FLEdBQU4sRUFBY2MsVUFBZCxxQkFBdkI7O0FBRUEsWUFBSU4sY0FBY0EsV0FBV1MsWUFBWCxLQUE0QixJQUExQyxJQUNBUixjQURBLElBQ2tCQSxlQUFlUSxZQUFmLEtBQWdDLElBRHRELEVBQzREO0FBQzFEckIsa0JBQVFzQixNQUFSLENBQWVoQixLQUFLaUIsUUFBcEIsb0NBQTZERixZQUE3RDtBQUNEO0FBQ0Y7QUF2REksS0FBUDtBQXlERDtBQS9GWSxDIiwiZmlsZSI6Im5vLXVuZGVmLWNsYXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCB7XG4gIGdldFN0eWxlSW1wb3J0Tm9kZURhdGEsXG4gIGdldEFTVCxcbiAgZmlsZUV4aXN0cyxcbiAgZ2V0U3R5bGVDbGFzc2VzLFxuICBnZXRQcm9wZXJ0eU5hbWUsXG4gIGdldENsYXNzZXNNYXAsXG4gIGdldEV4cG9ydFByb3BzTWFwLFxuICBnZXRGaWxlUGF0aCxcbn0gZnJvbSAnLi4vY29yZSc7XG5cbmltcG9ydCB0eXBlIHsgSnNOb2RlIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG1ldGE6IHtcbiAgICBkb2NzOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0NoZWNrcyB0aGF0IHlvdSBhcmUgdXNpbmcgdGhlIGV4aXN0ZW50IGNzcy9zY3NzL2xlc3MgY2xhc3NlcycsXG4gICAgICByZWNvbW1lbmRlZDogdHJ1ZSxcbiAgICB9LFxuICAgIHNjaGVtYTogW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGNhbWVsQ2FzZTogeyBlbnVtOiBbdHJ1ZSwgJ2Rhc2hlcycsICdvbmx5JywgJ2Rhc2hlcy1vbmx5J10gfVxuICAgICAgICB9LFxuICAgICAgfVxuICAgIF0sXG4gIH0sXG4gIGNyZWF0ZSAoY29udGV4dDogT2JqZWN0KSB7XG4gICAgY29uc3QgY2FtZWxDYXNlID0gXy5nZXQoY29udGV4dCwgJ29wdGlvbnNbMF0uY2FtZWxDYXNlJyk7XG4gICAgY29uc3Qgc3ludGF4TmFtZSA9IF8uZ2V0KGNvbnRleHQsICdvcHRpb25zWzBdLnN5bnRheCcpO1xuXG4gICAgLypcbiAgICAgICBtYXBzIHZhcmlhYmxlIG5hbWUgdG8gcHJvcGVydHkgT2JqZWN0XG4gICAgICAgbWFwID0ge1xuICAgICAgICAgW3ZhcmlhYmxlTmFtZV06IHtcbiAgICAgICAgICAgY2xhc3Nlc01hcDogeyBmb286ICdmb28nLCBmb29CYXI6ICdmb28tYmFyJywgJ2Zvby1iYXInOiAnZm9vLWJhcicgfSxcbiAgICAgICAgICAgbm9kZTogey4uLn1cbiAgICAgICAgIH1cbiAgICAgICB9XG5cbiAgICAgICBleGFtcGxlOlxuICAgICAgIGltcG9ydCBzIGZyb20gJy4vZm9vLnNjc3MnO1xuICAgICAgIHMgaXMgdmFyaWFibGUgbmFtZVxuXG4gICAgICAgcHJvcGVydHkgT2JqZWN0IGhhcyB0d28ga2V5c1xuICAgICAgIDEuIGNsYXNzZXNNYXA6IGFuIG9iamVjdCB3aXRoIHByb3BlcnR5TmFtZSBhcyBrZXkgYW5kIGl0cyBjbGFzc05hbWUgYXMgdmFsdWVcbiAgICAgICAyLiBub2RlOiBub2RlIHRoYXQgY29ycmVzcG9uZCB0byBzIChzZWUgZXhhbXBsZSBhYm92ZSlcbiAgICAgKi9cbiAgICBjb25zdCBtYXAgPSB7fTtcblxuICAgIHJldHVybiB7XG4gICAgICBJbXBvcnREZWNsYXJhdGlvbiAobm9kZTogSnNOb2RlKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlSW1wb3J0Tm9kZURhdGEgPSBnZXRTdHlsZUltcG9ydE5vZGVEYXRhKG5vZGUpO1xuXG4gICAgICAgIGlmICghc3R5bGVJbXBvcnROb2RlRGF0YSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBpbXBvcnROYW1lLFxuICAgICAgICAgIHN0eWxlRmlsZVBhdGgsXG4gICAgICAgICAgaW1wb3J0Tm9kZSxcbiAgICAgICAgfSA9IHN0eWxlSW1wb3J0Tm9kZURhdGE7XG5cbiAgICAgICAgY29uc3Qgc3R5bGVGaWxlQWJzb2x1dGVQYXRoID0gZ2V0RmlsZVBhdGgoY29udGV4dCwgc3R5bGVGaWxlUGF0aCk7XG4gICAgICAgIGxldCBjbGFzc2VzTWFwID0ge307XG4gICAgICAgIGxldCBleHBvcnRQcm9wc01hcCA9IHt9O1xuXG4gICAgICAgIGlmIChmaWxlRXhpc3RzKHN0eWxlRmlsZUFic29sdXRlUGF0aCkpIHtcbiAgICAgICAgICBjb25zdCBhc3QgPSBnZXRBU1Qoc3R5bGVGaWxlQWJzb2x1dGVQYXRoLCBzeW50YXhOYW1lKTtcbiAgICAgICAgICBjb25zdCBjbGFzc2VzID0gYXN0ICYmIGdldFN0eWxlQ2xhc3Nlcyhhc3QpO1xuXG4gICAgICAgICAgY2xhc3Nlc01hcCA9IGNsYXNzZXMgJiYgZ2V0Q2xhc3Nlc01hcChjbGFzc2VzLCBjYW1lbENhc2UpO1xuICAgICAgICAgIGV4cG9ydFByb3BzTWFwID0gYXN0ICYmIGdldEV4cG9ydFByb3BzTWFwKGFzdCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGlzIHdpbGwgYmUgdXNlZCB0byBjaGVjayBpZiBjbGFzc2VzIGFyZSBkZWZpbmVkXG4gICAgICAgIF8uc2V0KG1hcCwgYCR7aW1wb3J0TmFtZX0uY2xhc3Nlc01hcGAsIGNsYXNzZXNNYXApO1xuXG4gICAgICAgIC8vIHRoaXMgd2lsbCBiZSB1c2VkIHRvIGNoZWNrIGlmIDpleHBvcnQgcHJvcGVydGllcyBhcmUgZGVmaW5lZFxuICAgICAgICBfLnNldChtYXAsIGAke2ltcG9ydE5hbWV9LmV4cG9ydFByb3BzTWFwYCwgZXhwb3J0UHJvcHNNYXApO1xuXG4gICAgICAgIC8vIHNhdmUgbm9kZSBmb3IgcmVwb3J0aW5nIHVudXNlZCBzdHlsZXNcbiAgICAgICAgXy5zZXQobWFwLCBgJHtpbXBvcnROYW1lfS5ub2RlYCwgaW1wb3J0Tm9kZSk7XG4gICAgICB9LFxuICAgICAgTWVtYmVyRXhwcmVzc2lvbjogKG5vZGU6IEpzTm9kZSkgPT4ge1xuICAgICAgICAvKlxuICAgICAgICAgICBDaGVjayBpZiBwcm9wZXJ0eSBleGlzdHMgaW4gY3NzL3Njc3MgZmlsZSBhcyBjbGFzc1xuICAgICAgICAgKi9cblxuICAgICAgICBjb25zdCBvYmplY3ROYW1lID0gbm9kZS5vYmplY3QubmFtZTtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eU5hbWUgPSBnZXRQcm9wZXJ0eU5hbWUobm9kZSwgY2FtZWxDYXNlKTtcblxuICAgICAgICBpZiAoIXByb3BlcnR5TmFtZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsYXNzZXNNYXAgPSBfLmdldChtYXAsIGAke29iamVjdE5hbWV9LmNsYXNzZXNNYXBgKTtcbiAgICAgICAgY29uc3QgZXhwb3J0UHJvcHNNYXAgPSBfLmdldChtYXAsIGAke29iamVjdE5hbWV9LmV4cG9ydFByb3BzTWFwYCk7XG5cbiAgICAgICAgaWYgKGNsYXNzZXNNYXAgJiYgY2xhc3Nlc01hcFtwcm9wZXJ0eU5hbWVdID09IG51bGwgJiZcbiAgICAgICAgICAgIGV4cG9ydFByb3BzTWFwICYmIGV4cG9ydFByb3BzTWFwW3Byb3BlcnR5TmFtZV0gPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnRleHQucmVwb3J0KG5vZGUucHJvcGVydHksIGBDbGFzcyBvciBleHBvcnRlZCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eU5hbWV9JyBub3QgZm91bmRgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn07XG4iXX0=