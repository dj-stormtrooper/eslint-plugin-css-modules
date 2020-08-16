'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fp = require('lodash/fp');

var _fp2 = _interopRequireDefault(_fp);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _core = require('../core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  meta: {
    docs: {
      description: 'Checks that you are using all css/scss/less classes',
      recommended: true
    },
    schema: [{
      type: 'object',
      properties: {
        camelCase: { enum: [true, 'dashes', 'only', 'dashes-only'] },
        markAsUsed: { type: 'array' }
      }
    }]
  },
  create: function create(context) {
    var markAsUsed = _lodash2.default.get(context, 'options[0].markAsUsed');
    var camelCase = _lodash2.default.get(context, 'options[0].camelCase');
    var syntaxName = _lodash2.default.get(context, 'options[0].syntax');

    /*
       maps variable name to property Object
       map = {
         [variableName]: {
           classes: { foo: false, 'foo-bar': false },
           classesMap: { foo: 'foo', fooBar: 'foo-bar', 'foo-bar': 'foo-bar' },
           node: {...}
         }
       }
        example:
       import s from './foo.scss';
       s is variable name
        property Object has two keys
       1. classes: an object with className as key and a boolean as value. The boolean is marked if it is used in file
       2. classesMap: an object with propertyName as key and its className as value
       3. node: node that correspond to s (see example above)
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

        var classes = {};
        var classesMap = {};

        if ((0, _core.fileExists)(styleFileAbsolutePath)) {
          // this will be used to mark s.foo as used in MemberExpression
          var ast = (0, _core.getAST)(styleFileAbsolutePath, syntaxName);
          classes = ast && (0, _core.getStyleClasses)(ast);
          classesMap = classes && (0, _core.getClassesMap)(classes, camelCase);
        }

        _lodash2.default.set(map, importName + '.classes', classes);
        _lodash2.default.set(map, importName + '.classesMap', classesMap);

        // save node for reporting unused styles
        _lodash2.default.set(map, importName + '.node', importNode);

        // save file path for reporting unused styles
        _lodash2.default.set(map, importName + '.filePath', styleFilePath);
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

        var className = _lodash2.default.get(map, objectName + '.classesMap.' + propertyName);

        if (className == null) {
          return;
        }

        // mark this property has used
        _lodash2.default.set(map, objectName + '.classes.' + className, true);
      },
      'Program:exit': function ProgramExit() {
        /*
           Check if all classes defined in css/scss file are used
         */

        /*
           we are looping over each import style node in program
           example:
           ```
             import s from './foo.css';
             import x from './bar.scss';
           ```
           then the loop will be run 2 times
         */
        _lodash2.default.forIn(map, function (o) {
          var classes = o.classes,
              node = o.node,
              filePath = o.filePath;

          /*
             if option is passed to mark a class as used, example:
             eslint css-modules/no-unused-class: [2, { markAsUsed: ['container'] }]
           */

          _lodash2.default.forEach(markAsUsed, function (usedClass) {
            classes[usedClass] = true;
          });

          // classNames not marked as true are unused
          var unusedClasses = _fp2.default.compose(_fp2.default.keys, _fp2.default.omitBy(_fp2.default.identity) // omit truthy values
          )(classes);

          if (!_lodash2.default.isEmpty(unusedClasses)) {
            context.report(node, 'Unused classes found in ' + _path2.default.basename(filePath) + ': ' + unusedClasses.join(', '));
          }
        });
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9ydWxlcy9uby11bnVzZWQtY2xhc3MuanMiXSwibmFtZXMiOlsibWV0YSIsImRvY3MiLCJkZXNjcmlwdGlvbiIsInJlY29tbWVuZGVkIiwic2NoZW1hIiwidHlwZSIsInByb3BlcnRpZXMiLCJjYW1lbENhc2UiLCJlbnVtIiwibWFya0FzVXNlZCIsImNyZWF0ZSIsImNvbnRleHQiLCJfIiwiZ2V0Iiwic3ludGF4TmFtZSIsIm1hcCIsIkltcG9ydERlY2xhcmF0aW9uIiwibm9kZSIsInN0eWxlSW1wb3J0Tm9kZURhdGEiLCJpbXBvcnROYW1lIiwic3R5bGVGaWxlUGF0aCIsImltcG9ydE5vZGUiLCJzdHlsZUZpbGVBYnNvbHV0ZVBhdGgiLCJjbGFzc2VzIiwiY2xhc3Nlc01hcCIsImFzdCIsInNldCIsIk1lbWJlckV4cHJlc3Npb24iLCJvYmplY3ROYW1lIiwib2JqZWN0IiwibmFtZSIsInByb3BlcnR5TmFtZSIsImNsYXNzTmFtZSIsImZvckluIiwibyIsImZpbGVQYXRoIiwiZm9yRWFjaCIsInVzZWRDbGFzcyIsInVudXNlZENsYXNzZXMiLCJmcCIsImNvbXBvc2UiLCJrZXlzIiwib21pdEJ5IiwiaWRlbnRpdHkiLCJpc0VtcHR5IiwicmVwb3J0IiwicGF0aCIsImJhc2VuYW1lIiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7a0JBWWU7QUFDYkEsUUFBTTtBQUNKQyxVQUFNO0FBQ0pDLG1CQUFhLHFEQURUO0FBRUpDLG1CQUFhO0FBRlQsS0FERjtBQUtKQyxZQUFRLENBQ047QUFDRUMsWUFBTSxRQURSO0FBRUVDLGtCQUFZO0FBQ1ZDLG1CQUFXLEVBQUVDLE1BQU0sQ0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixNQUFqQixFQUF5QixhQUF6QixDQUFSLEVBREQ7QUFFVkMsb0JBQVksRUFBRUosTUFBTSxPQUFSO0FBRkY7QUFGZCxLQURNO0FBTEosR0FETztBQWdCYkssUUFoQmEs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RUk7QUFGSixZQUdwQnBCLE9BSG9CLENBQXRCOztBQUtBLGNBQUksQ0FBQ1gsaUJBQUVnQyxPQUFGLENBQVVOLGFBQVYsQ0FBTCxFQUErQjtBQUM3QjNCLG9CQUFRa0MsTUFBUixDQUFlNUIsSUFBZiwrQkFBZ0Q2QixlQUFLQyxRQUFMLENBQWNaLFFBQWQsQ0FBaEQsVUFBNEVHLGNBQWNVLElBQWQsQ0FBbUIsSUFBbkIsQ0FBNUU7QUFDRDtBQUNGLFNBcEJEO0FBcUJEO0FBM0ZJLEtBQVA7QUE2RkQ7QUF2SVksQyIsImZpbGUiOiJuby11bnVzZWQtY2xhc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuaW1wb3J0IGZwIGZyb20gJ2xvZGFzaC9mcCc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7XG4gIGdldFN0eWxlSW1wb3J0Tm9kZURhdGEsXG4gIGdldFN0eWxlQ2xhc3NlcyxcbiAgZ2V0UHJvcGVydHlOYW1lLFxuICBnZXRDbGFzc2VzTWFwLFxuICBnZXRGaWxlUGF0aCxcbiAgZ2V0QVNULFxuICBmaWxlRXhpc3RzLFxufSBmcm9tICcuLi9jb3JlJztcblxuaW1wb3J0IHR5cGUgeyBKc05vZGUgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbWV0YToge1xuICAgIGRvY3M6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ2hlY2tzIHRoYXQgeW91IGFyZSB1c2luZyBhbGwgY3NzL3Njc3MvbGVzcyBjbGFzc2VzJyxcbiAgICAgIHJlY29tbWVuZGVkOiB0cnVlLFxuICAgIH0sXG4gICAgc2NoZW1hOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgY2FtZWxDYXNlOiB7IGVudW06IFt0cnVlLCAnZGFzaGVzJywgJ29ubHknLCAnZGFzaGVzLW9ubHknXSB9LFxuICAgICAgICAgIG1hcmtBc1VzZWQ6IHsgdHlwZTogJ2FycmF5JyB9LFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIF0sXG4gIH0sXG4gIGNyZWF0ZSAoY29udGV4dDogT2JqZWN0KSB7XG4gICAgY29uc3QgbWFya0FzVXNlZCA9IF8uZ2V0KGNvbnRleHQsICdvcHRpb25zWzBdLm1hcmtBc1VzZWQnKTtcbiAgICBjb25zdCBjYW1lbENhc2UgPSBfLmdldChjb250ZXh0LCAnb3B0aW9uc1swXS5jYW1lbENhc2UnKTtcbiAgICBjb25zdCBzeW50YXhOYW1lID0gXy5nZXQoY29udGV4dCwgJ29wdGlvbnNbMF0uc3ludGF4Jyk7XG5cbiAgICAvKlxuICAgICAgIG1hcHMgdmFyaWFibGUgbmFtZSB0byBwcm9wZXJ0eSBPYmplY3RcbiAgICAgICBtYXAgPSB7XG4gICAgICAgICBbdmFyaWFibGVOYW1lXToge1xuICAgICAgICAgICBjbGFzc2VzOiB7IGZvbzogZmFsc2UsICdmb28tYmFyJzogZmFsc2UgfSxcbiAgICAgICAgICAgY2xhc3Nlc01hcDogeyBmb286ICdmb28nLCBmb29CYXI6ICdmb28tYmFyJywgJ2Zvby1iYXInOiAnZm9vLWJhcicgfSxcbiAgICAgICAgICAgbm9kZTogey4uLn1cbiAgICAgICAgIH1cbiAgICAgICB9XG5cbiAgICAgICBleGFtcGxlOlxuICAgICAgIGltcG9ydCBzIGZyb20gJy4vZm9vLnNjc3MnO1xuICAgICAgIHMgaXMgdmFyaWFibGUgbmFtZVxuXG4gICAgICAgcHJvcGVydHkgT2JqZWN0IGhhcyB0d28ga2V5c1xuICAgICAgIDEuIGNsYXNzZXM6IGFuIG9iamVjdCB3aXRoIGNsYXNzTmFtZSBhcyBrZXkgYW5kIGEgYm9vbGVhbiBhcyB2YWx1ZS4gVGhlIGJvb2xlYW4gaXMgbWFya2VkIGlmIGl0IGlzIHVzZWQgaW4gZmlsZVxuICAgICAgIDIuIGNsYXNzZXNNYXA6IGFuIG9iamVjdCB3aXRoIHByb3BlcnR5TmFtZSBhcyBrZXkgYW5kIGl0cyBjbGFzc05hbWUgYXMgdmFsdWVcbiAgICAgICAzLiBub2RlOiBub2RlIHRoYXQgY29ycmVzcG9uZCB0byBzIChzZWUgZXhhbXBsZSBhYm92ZSlcbiAgICAgKi9cbiAgICBjb25zdCBtYXAgPSB7fTtcblxuICAgIHJldHVybiB7XG4gICAgICBJbXBvcnREZWNsYXJhdGlvbiAobm9kZTogSnNOb2RlKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlSW1wb3J0Tm9kZURhdGEgPSBnZXRTdHlsZUltcG9ydE5vZGVEYXRhKG5vZGUpO1xuXG4gICAgICAgIGlmICghc3R5bGVJbXBvcnROb2RlRGF0YSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBpbXBvcnROYW1lLFxuICAgICAgICAgIHN0eWxlRmlsZVBhdGgsXG4gICAgICAgICAgaW1wb3J0Tm9kZSxcbiAgICAgICAgfSA9IHN0eWxlSW1wb3J0Tm9kZURhdGE7XG5cbiAgICAgICAgY29uc3Qgc3R5bGVGaWxlQWJzb2x1dGVQYXRoID0gZ2V0RmlsZVBhdGgoY29udGV4dCwgc3R5bGVGaWxlUGF0aCk7XG5cbiAgICAgICAgbGV0IGNsYXNzZXMgPSB7fTtcbiAgICAgICAgbGV0IGNsYXNzZXNNYXAgPSB7fTtcblxuICAgICAgICBpZiAoZmlsZUV4aXN0cyhzdHlsZUZpbGVBYnNvbHV0ZVBhdGgpKSB7XG4gICAgICAgICAgLy8gdGhpcyB3aWxsIGJlIHVzZWQgdG8gbWFyayBzLmZvbyBhcyB1c2VkIGluIE1lbWJlckV4cHJlc3Npb25cbiAgICAgICAgICBjb25zdCBhc3QgPSBnZXRBU1Qoc3R5bGVGaWxlQWJzb2x1dGVQYXRoLCBzeW50YXhOYW1lKTtcbiAgICAgICAgICBjbGFzc2VzID0gYXN0ICYmIGdldFN0eWxlQ2xhc3Nlcyhhc3QpO1xuICAgICAgICAgIGNsYXNzZXNNYXAgPSBjbGFzc2VzICYmIGdldENsYXNzZXNNYXAoY2xhc3NlcywgY2FtZWxDYXNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uc2V0KG1hcCwgYCR7aW1wb3J0TmFtZX0uY2xhc3Nlc2AsIGNsYXNzZXMpO1xuICAgICAgICBfLnNldChtYXAsIGAke2ltcG9ydE5hbWV9LmNsYXNzZXNNYXBgLCBjbGFzc2VzTWFwKTtcblxuICAgICAgICAvLyBzYXZlIG5vZGUgZm9yIHJlcG9ydGluZyB1bnVzZWQgc3R5bGVzXG4gICAgICAgIF8uc2V0KG1hcCwgYCR7aW1wb3J0TmFtZX0ubm9kZWAsIGltcG9ydE5vZGUpO1xuXG4gICAgICAgIC8vIHNhdmUgZmlsZSBwYXRoIGZvciByZXBvcnRpbmcgdW51c2VkIHN0eWxlc1xuICAgICAgICBfLnNldChtYXAsIGAke2ltcG9ydE5hbWV9LmZpbGVQYXRoYCwgc3R5bGVGaWxlUGF0aCk7XG4gICAgICB9LFxuICAgICAgTWVtYmVyRXhwcmVzc2lvbjogKG5vZGU6IEpzTm9kZSkgPT4ge1xuICAgICAgICAvKlxuICAgICAgICAgICBDaGVjayBpZiBwcm9wZXJ0eSBleGlzdHMgaW4gY3NzL3Njc3MgZmlsZSBhcyBjbGFzc1xuICAgICAgICAgKi9cblxuICAgICAgICBjb25zdCBvYmplY3ROYW1lID0gbm9kZS5vYmplY3QubmFtZTtcbiAgICAgICAgY29uc3QgcHJvcGVydHlOYW1lID0gZ2V0UHJvcGVydHlOYW1lKG5vZGUsIGNhbWVsQ2FzZSk7XG5cbiAgICAgICAgaWYgKCFwcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBfLmdldChtYXAsIGAke29iamVjdE5hbWV9LmNsYXNzZXNNYXAuJHtwcm9wZXJ0eU5hbWV9YCk7XG5cbiAgICAgICAgaWYgKGNsYXNzTmFtZSA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWFyayB0aGlzIHByb3BlcnR5IGhhcyB1c2VkXG4gICAgICAgIF8uc2V0KG1hcCwgYCR7b2JqZWN0TmFtZX0uY2xhc3Nlcy4ke2NsYXNzTmFtZX1gLCB0cnVlKTtcbiAgICAgIH0sXG4gICAgICAnUHJvZ3JhbTpleGl0JyAoKSB7XG4gICAgICAgIC8qXG4gICAgICAgICAgIENoZWNrIGlmIGFsbCBjbGFzc2VzIGRlZmluZWQgaW4gY3NzL3Njc3MgZmlsZSBhcmUgdXNlZFxuICAgICAgICAgKi9cblxuICAgICAgICAvKlxuICAgICAgICAgICB3ZSBhcmUgbG9vcGluZyBvdmVyIGVhY2ggaW1wb3J0IHN0eWxlIG5vZGUgaW4gcHJvZ3JhbVxuICAgICAgICAgICBleGFtcGxlOlxuICAgICAgICAgICBgYGBcbiAgICAgICAgICAgICBpbXBvcnQgcyBmcm9tICcuL2Zvby5jc3MnO1xuICAgICAgICAgICAgIGltcG9ydCB4IGZyb20gJy4vYmFyLnNjc3MnO1xuICAgICAgICAgICBgYGBcbiAgICAgICAgICAgdGhlbiB0aGUgbG9vcCB3aWxsIGJlIHJ1biAyIHRpbWVzXG4gICAgICAgICAqL1xuICAgICAgICBfLmZvckluKG1hcCwgKG8pID0+IHtcbiAgICAgICAgICBjb25zdCB7IGNsYXNzZXMsIG5vZGUsIGZpbGVQYXRoIH0gPSBvO1xuXG4gICAgICAgICAgLypcbiAgICAgICAgICAgICBpZiBvcHRpb24gaXMgcGFzc2VkIHRvIG1hcmsgYSBjbGFzcyBhcyB1c2VkLCBleGFtcGxlOlxuICAgICAgICAgICAgIGVzbGludCBjc3MtbW9kdWxlcy9uby11bnVzZWQtY2xhc3M6IFsyLCB7IG1hcmtBc1VzZWQ6IFsnY29udGFpbmVyJ10gfV1cbiAgICAgICAgICAgKi9cbiAgICAgICAgICBfLmZvckVhY2gobWFya0FzVXNlZCwgKHVzZWRDbGFzcykgPT4ge1xuICAgICAgICAgICAgY2xhc3Nlc1t1c2VkQ2xhc3NdID0gdHJ1ZTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIGNsYXNzTmFtZXMgbm90IG1hcmtlZCBhcyB0cnVlIGFyZSB1bnVzZWRcbiAgICAgICAgICBjb25zdCB1bnVzZWRDbGFzc2VzID0gZnAuY29tcG9zZShcbiAgICAgICAgICAgIGZwLmtleXMsXG4gICAgICAgICAgICBmcC5vbWl0QnkoZnAuaWRlbnRpdHkpLCAvLyBvbWl0IHRydXRoeSB2YWx1ZXNcbiAgICAgICAgICApKGNsYXNzZXMpO1xuXG4gICAgICAgICAgaWYgKCFfLmlzRW1wdHkodW51c2VkQ2xhc3NlcykpIHtcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KG5vZGUsIGBVbnVzZWQgY2xhc3NlcyBmb3VuZCBpbiAke3BhdGguYmFzZW5hbWUoZmlsZVBhdGgpfTogJHt1bnVzZWRDbGFzc2VzLmpvaW4oJywgJyl9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuIl19