/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/utilities/webgl-debug.js":
/*!**************************************!*\
  !*** ./src/utilities/webgl-debug.js ***!
  \**************************************/
/***/ (() => {

eval("/*\n ** Copyright (c) 2012 The Khronos Group Inc.\n **\n ** Permission is hereby granted, free of charge, to any person obtaining a\n ** copy of this software and/or associated documentation files (the\n ** \"Materials\"), to deal in the Materials without restriction, including\n ** without limitation the rights to use, copy, modify, merge, publish,\n ** distribute, sublicense, and/or sell copies of the Materials, and to\n ** permit persons to whom the Materials are furnished to do so, subject to\n ** the following conditions:\n **\n ** The above copyright notice and this permission notice shall be included\n ** in all copies or substantial portions of the Materials.\n **\n ** THE MATERIALS ARE PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND,\n ** EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n ** MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.\n ** IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY\n ** CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,\n ** TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE\n ** MATERIALS OR THE USE OR OTHER DEALINGS IN THE MATERIALS.\n */\n\n// Various functions for helping debug WebGL apps.\n\nWebGLDebugUtils = (function () {\n  /**\n   * Wrapped logging function.\n   * @param {string} msg Message to log.\n   */\n  var log = function (msg) {\n    if (window.console && window.console.log) {\n      window.console.log(msg);\n    }\n  };\n\n  /**\n   * Wrapped error logging function.\n   * @param {string} msg Message to log.\n   */\n  var error = function (msg) {\n    if (window.console && window.console.error) {\n      window.console.error(msg);\n    } else {\n      log(msg);\n    }\n  };\n\n  /**\n   * Which arguments are enums based on the number of arguments to the function.\n   * So\n   *    'texImage2D': {\n   *       9: { 0:true, 2:true, 6:true, 7:true },\n   *       6: { 0:true, 2:true, 3:true, 4:true },\n   *    },\n   *\n   * means if there are 9 arguments then 6 and 7 are enums, if there are 6\n   * arguments 3 and 4 are enums\n   *\n   * @type {!Object.<number, !Object.<number, string>}\n   */\n  var glValidEnumContexts = {\n    // Generic setters and getters\n\n    enable: { 1: { 0: true } },\n    disable: { 1: { 0: true } },\n    getParameter: { 1: { 0: true } },\n\n    // Rendering\n\n    drawArrays: { 3: { 0: true } },\n    drawElements: { 4: { 0: true, 2: true } },\n\n    // Shaders\n\n    createShader: { 1: { 0: true } },\n    getShaderParameter: { 2: { 1: true } },\n    getProgramParameter: { 2: { 1: true } },\n    getShaderPrecisionFormat: { 2: { 0: true, 1: true } },\n\n    // Vertex attributes\n\n    getVertexAttrib: { 2: { 1: true } },\n    vertexAttribPointer: { 6: { 2: true } },\n\n    // Textures\n\n    bindTexture: { 2: { 0: true } },\n    activeTexture: { 1: { 0: true } },\n    getTexParameter: { 2: { 0: true, 1: true } },\n    texParameterf: { 3: { 0: true, 1: true } },\n    texParameteri: { 3: { 0: true, 1: true, 2: true } },\n    // texImage2D and texSubImage2D are defined below with WebGL 2 entrypoints\n    copyTexImage2D: { 8: { 0: true, 2: true } },\n    copyTexSubImage2D: { 8: { 0: true } },\n    generateMipmap: { 1: { 0: true } },\n    // compressedTexImage2D and compressedTexSubImage2D are defined below with WebGL 2 entrypoints\n\n    // Buffer objects\n\n    bindBuffer: { 2: { 0: true } },\n    // bufferData and bufferSubData are defined below with WebGL 2 entrypoints\n    getBufferParameter: { 2: { 0: true, 1: true } },\n\n    // Renderbuffers and framebuffers\n\n    pixelStorei: { 2: { 0: true, 1: true } },\n    // readPixels is defined below with WebGL 2 entrypoints\n    bindRenderbuffer: { 2: { 0: true } },\n    bindFramebuffer: { 2: { 0: true } },\n    checkFramebufferStatus: { 1: { 0: true } },\n    framebufferRenderbuffer: { 4: { 0: true, 1: true, 2: true } },\n    framebufferTexture2D: { 5: { 0: true, 1: true, 2: true } },\n    getFramebufferAttachmentParameter: { 3: { 0: true, 1: true, 2: true } },\n    getRenderbufferParameter: { 2: { 0: true, 1: true } },\n    renderbufferStorage: { 4: { 0: true, 1: true } },\n\n    // Frame buffer operations (clear, blend, depth test, stencil)\n\n    clear: {\n      1: {\n        0: {\n          enumBitwiseOr: [\n            'COLOR_BUFFER_BIT',\n            'DEPTH_BUFFER_BIT',\n            'STENCIL_BUFFER_BIT',\n          ],\n        },\n      },\n    },\n    depthFunc: { 1: { 0: true } },\n    blendFunc: { 2: { 0: true, 1: true } },\n    blendFuncSeparate: { 4: { 0: true, 1: true, 2: true, 3: true } },\n    blendEquation: { 1: { 0: true } },\n    blendEquationSeparate: { 2: { 0: true, 1: true } },\n    stencilFunc: { 3: { 0: true } },\n    stencilFuncSeparate: { 4: { 0: true, 1: true } },\n    stencilMaskSeparate: { 2: { 0: true } },\n    stencilOp: { 3: { 0: true, 1: true, 2: true } },\n    stencilOpSeparate: { 4: { 0: true, 1: true, 2: true, 3: true } },\n\n    // Culling\n\n    cullFace: { 1: { 0: true } },\n    frontFace: { 1: { 0: true } },\n\n    // ANGLE_instanced_arrays extension\n\n    drawArraysInstancedANGLE: { 4: { 0: true } },\n    drawElementsInstancedANGLE: { 5: { 0: true, 2: true } },\n\n    // EXT_blend_minmax extension\n\n    blendEquationEXT: { 1: { 0: true } },\n\n    // WebGL 2 Buffer objects\n\n    bufferData: {\n      3: { 0: true, 2: true }, // WebGL 1\n      4: { 0: true, 2: true }, // WebGL 2\n      5: { 0: true, 2: true }, // WebGL 2\n    },\n    bufferSubData: {\n      3: { 0: true }, // WebGL 1\n      4: { 0: true }, // WebGL 2\n      5: { 0: true }, // WebGL 2\n    },\n    copyBufferSubData: { 5: { 0: true, 1: true } },\n    getBufferSubData: { 3: { 0: true }, 4: { 0: true }, 5: { 0: true } },\n\n    // WebGL 2 Framebuffer objects\n\n    blitFramebuffer: {\n      10: {\n        8: {\n          enumBitwiseOr: [\n            'COLOR_BUFFER_BIT',\n            'DEPTH_BUFFER_BIT',\n            'STENCIL_BUFFER_BIT',\n          ],\n        },\n        9: true,\n      },\n    },\n    framebufferTextureLayer: { 5: { 0: true, 1: true } },\n    invalidateFramebuffer: { 2: { 0: true } },\n    invalidateSubFramebuffer: { 6: { 0: true } },\n    readBuffer: { 1: { 0: true } },\n\n    // WebGL 2 Renderbuffer objects\n\n    getInternalformatParameter: { 3: { 0: true, 1: true, 2: true } },\n    renderbufferStorageMultisample: { 5: { 0: true, 2: true } },\n\n    // WebGL 2 Texture objects\n\n    texStorage2D: { 5: { 0: true, 2: true } },\n    texStorage3D: { 6: { 0: true, 2: true } },\n    texImage2D: {\n      9: { 0: true, 2: true, 6: true, 7: true }, // WebGL 1 & 2\n      6: { 0: true, 2: true, 3: true, 4: true }, // WebGL 1\n      10: { 0: true, 2: true, 6: true, 7: true }, // WebGL 2\n    },\n    texImage3D: {\n      10: { 0: true, 2: true, 7: true, 8: true },\n      11: { 0: true, 2: true, 7: true, 8: true },\n    },\n    texSubImage2D: {\n      9: { 0: true, 6: true, 7: true }, // WebGL 1 & 2\n      7: { 0: true, 4: true, 5: true }, // WebGL 1\n      10: { 0: true, 6: true, 7: true }, // WebGL 2\n    },\n    texSubImage3D: {\n      11: { 0: true, 8: true, 9: true },\n      12: { 0: true, 8: true, 9: true },\n    },\n    copyTexSubImage3D: { 9: { 0: true } },\n    compressedTexImage2D: {\n      7: { 0: true, 2: true }, // WebGL 1 & 2\n      8: { 0: true, 2: true }, // WebGL 2\n      9: { 0: true, 2: true }, // WebGL 2\n    },\n    compressedTexImage3D: {\n      8: { 0: true, 2: true },\n      9: { 0: true, 2: true },\n      10: { 0: true, 2: true },\n    },\n    compressedTexSubImage2D: {\n      8: { 0: true, 6: true }, // WebGL 1 & 2\n      9: { 0: true, 6: true }, // WebGL 2\n      10: { 0: true, 6: true }, // WebGL 2\n    },\n    compressedTexSubImage3D: {\n      10: { 0: true, 8: true },\n      11: { 0: true, 8: true },\n      12: { 0: true, 8: true },\n    },\n\n    // WebGL 2 Vertex attribs\n\n    vertexAttribIPointer: { 5: { 2: true } },\n\n    // WebGL 2 Writing to the drawing buffer\n\n    drawArraysInstanced: { 4: { 0: true } },\n    drawElementsInstanced: { 5: { 0: true, 2: true } },\n    drawRangeElements: { 6: { 0: true, 4: true } },\n\n    // WebGL 2 Reading back pixels\n\n    readPixels: {\n      7: { 4: true, 5: true }, // WebGL 1 & 2\n      8: { 4: true, 5: true }, // WebGL 2\n    },\n\n    // WebGL 2 Multiple Render Targets\n\n    clearBufferfv: { 3: { 0: true }, 4: { 0: true } },\n    clearBufferiv: { 3: { 0: true }, 4: { 0: true } },\n    clearBufferuiv: { 3: { 0: true }, 4: { 0: true } },\n    clearBufferfi: { 4: { 0: true } },\n\n    // WebGL 2 Query objects\n\n    beginQuery: { 2: { 0: true } },\n    endQuery: { 1: { 0: true } },\n    getQuery: { 2: { 0: true, 1: true } },\n    getQueryParameter: { 2: { 1: true } },\n\n    // WebGL 2 Sampler objects\n\n    samplerParameteri: { 3: { 1: true, 2: true } },\n    samplerParameterf: { 3: { 1: true } },\n    getSamplerParameter: { 2: { 1: true } },\n\n    // WebGL 2 Sync objects\n\n    fenceSync: { 2: { 0: true, 1: { enumBitwiseOr: [] } } },\n    clientWaitSync: {\n      3: { 1: { enumBitwiseOr: ['SYNC_FLUSH_COMMANDS_BIT'] } },\n    },\n    waitSync: { 3: { 1: { enumBitwiseOr: [] } } },\n    getSyncParameter: { 2: { 1: true } },\n\n    // WebGL 2 Transform Feedback\n\n    bindTransformFeedback: { 2: { 0: true } },\n    beginTransformFeedback: { 1: { 0: true } },\n    transformFeedbackVaryings: { 3: { 2: true } },\n\n    // WebGL2 Uniform Buffer Objects and Transform Feedback Buffers\n\n    bindBufferBase: { 3: { 0: true } },\n    bindBufferRange: { 5: { 0: true } },\n    getIndexedParameter: { 2: { 0: true } },\n    getActiveUniforms: { 3: { 2: true } },\n    getActiveUniformBlockParameter: { 3: { 2: true } },\n  };\n\n  /**\n   * Map of numbers to names.\n   * @type {Object}\n   */\n  var glEnums = null;\n\n  /**\n   * Map of names to numbers.\n   * @type {Object}\n   */\n  var enumStringToValue = null;\n\n  /**\n   * Initializes this module. Safe to call more than once.\n   * @param {!WebGLRenderingContext} ctx A WebGL context. If\n   *    you have more than one context it doesn't matter which one\n   *    you pass in, it is only used to pull out constants.\n   */\n  function init(ctx) {\n    if (glEnums == null) {\n      glEnums = {};\n      enumStringToValue = {};\n      for (var propertyName in ctx) {\n        if (typeof ctx[propertyName] == 'number') {\n          glEnums[ctx[propertyName]] = propertyName;\n          enumStringToValue[propertyName] = ctx[propertyName];\n        }\n      }\n    }\n  }\n\n  /**\n   * Checks the utils have been initialized.\n   */\n  function checkInit() {\n    if (glEnums == null) {\n      throw 'WebGLDebugUtils.init(ctx) not called';\n    }\n  }\n\n  /**\n   * Returns true or false if value matches any WebGL enum\n   * @param {*} value Value to check if it might be an enum.\n   * @return {boolean} True if value matches one of the WebGL defined enums\n   */\n  function mightBeEnum(value) {\n    checkInit();\n    return glEnums[value] !== undefined;\n  }\n\n  /**\n   * Gets an string version of an WebGL enum.\n   *\n   * Example:\n   *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());\n   *\n   * @param {number} value Value to return an enum for\n   * @return {string} The string version of the enum.\n   */\n  function glEnumToString(value) {\n    checkInit();\n    var name = glEnums[value];\n    return name !== undefined\n      ? 'gl.' + name\n      : '/*UNKNOWN WebGL ENUM*/ 0x' + value.toString(16) + '';\n  }\n\n  /**\n   * Returns the string version of a WebGL argument.\n   * Attempts to convert enum arguments to strings.\n   * @param {string} functionName the name of the WebGL function.\n   * @param {number} numArgs the number of arguments passed to the function.\n   * @param {number} argumentIndx the index of the argument.\n   * @param {*} value The value of the argument.\n   * @return {string} The value as a string.\n   */\n  function glFunctionArgToString(functionName, numArgs, argumentIndex, value) {\n    var funcInfo = glValidEnumContexts[functionName];\n    if (funcInfo !== undefined) {\n      var funcInfo = funcInfo[numArgs];\n      if (funcInfo !== undefined) {\n        if (funcInfo[argumentIndex]) {\n          if (\n            typeof funcInfo[argumentIndex] === 'object' &&\n            funcInfo[argumentIndex]['enumBitwiseOr'] !== undefined\n          ) {\n            var enums = funcInfo[argumentIndex]['enumBitwiseOr'];\n            var orResult = 0;\n            var orEnums = [];\n            for (var i = 0; i < enums.length; ++i) {\n              var enumValue = enumStringToValue[enums[i]];\n              if ((value & enumValue) !== 0) {\n                orResult |= enumValue;\n                orEnums.push(glEnumToString(enumValue));\n              }\n            }\n            if (orResult === value) {\n              return orEnums.join(' | ');\n            } else {\n              return glEnumToString(value);\n            }\n          } else {\n            return glEnumToString(value);\n          }\n        }\n      }\n    }\n    if (value === null) {\n      return 'null';\n    } else if (value === undefined) {\n      return 'undefined';\n    } else {\n      return value.toString();\n    }\n  }\n\n  /**\n   * Converts the arguments of a WebGL function to a string.\n   * Attempts to convert enum arguments to strings.\n   *\n   * @param {string} functionName the name of the WebGL function.\n   * @param {number} args The arguments.\n   * @return {string} The arguments as a string.\n   */\n  function glFunctionArgsToString(functionName, args) {\n    // apparently we can't do args.join(\",\");\n    var argStr = '';\n    var numArgs = args.length;\n    for (var ii = 0; ii < numArgs; ++ii) {\n      argStr +=\n        (ii == 0 ? '' : ', ') +\n        glFunctionArgToString(functionName, numArgs, ii, args[ii]);\n    }\n    return argStr;\n  }\n\n  function makePropertyWrapper(wrapper, original, propertyName) {\n    //log(\"wrap prop: \" + propertyName);\n    wrapper.__defineGetter__(propertyName, function () {\n      return original[propertyName];\n    });\n    // TODO(gmane): this needs to handle properties that take more than\n    // one value?\n    wrapper.__defineSetter__(propertyName, function (value) {\n      //log(\"set: \" + propertyName);\n      original[propertyName] = value;\n    });\n  }\n\n  // Makes a function that calls a function on another object.\n  function makeFunctionWrapper(original, functionName) {\n    //log(\"wrap fn: \" + functionName);\n    var f = original[functionName];\n    return function () {\n      //log(\"call: \" + functionName);\n      var result = f.apply(original, arguments);\n      return result;\n    };\n  }\n\n  /**\n   * Given a WebGL context returns a wrapped context that calls\n   * gl.getError after every command and calls a function if the\n   * result is not gl.NO_ERROR.\n   *\n   * @param {!WebGLRenderingContext} ctx The webgl context to\n   *        wrap.\n   * @param {!function(err, funcName, args): void} opt_onErrorFunc\n   *        The function to call when gl.getError returns an\n   *        error. If not specified the default function calls\n   *        console.log with a message.\n   * @param {!function(funcName, args): void} opt_onFunc The\n   *        function to call when each webgl function is called.\n   *        You can use this to log all calls for example.\n   * @param {!WebGLRenderingContext} opt_err_ctx The webgl context\n   *        to call getError on if different than ctx.\n   */\n  function makeDebugContext(ctx, opt_onErrorFunc, opt_onFunc, opt_err_ctx) {\n    opt_err_ctx = opt_err_ctx || ctx;\n    init(ctx);\n    opt_onErrorFunc =\n      opt_onErrorFunc ||\n      function (err, functionName, args) {\n        // apparently we can't do args.join(\",\");\n        var argStr = '';\n        var numArgs = args.length;\n        for (var ii = 0; ii < numArgs; ++ii) {\n          argStr +=\n            (ii == 0 ? '' : ', ') +\n            glFunctionArgToString(functionName, numArgs, ii, args[ii]);\n        }\n        error(\n          'WebGL error ' +\n            glEnumToString(err) +\n            ' in ' +\n            functionName +\n            '(' +\n            argStr +\n            ')'\n        );\n      };\n\n    // Holds booleans for each GL error so after we get the error ourselves\n    // we can still return it to the client app.\n    var glErrorShadow = {};\n\n    // Makes a function that calls a WebGL function and then calls getError.\n    function makeErrorWrapper(ctx, functionName) {\n      return function () {\n        if (opt_onFunc) {\n          opt_onFunc(functionName, arguments);\n        }\n        var result = ctx[functionName].apply(ctx, arguments);\n        var err = opt_err_ctx.getError();\n        if (err != 0) {\n          glErrorShadow[err] = true;\n          opt_onErrorFunc(err, functionName, arguments);\n        }\n        return result;\n      };\n    }\n\n    // Make a an object that has a copy of every property of the WebGL context\n    // but wraps all functions.\n    var wrapper = {};\n    for (var propertyName in ctx) {\n      if (typeof ctx[propertyName] == 'function') {\n        if (propertyName != 'getExtension') {\n          wrapper[propertyName] = makeErrorWrapper(ctx, propertyName);\n        } else {\n          var wrapped = makeErrorWrapper(ctx, propertyName);\n          wrapper[propertyName] = function () {\n            var result = wrapped.apply(ctx, arguments);\n            if (!result) {\n              return null;\n            }\n            return makeDebugContext(\n              result,\n              opt_onErrorFunc,\n              opt_onFunc,\n              opt_err_ctx\n            );\n          };\n        }\n      } else {\n        makePropertyWrapper(wrapper, ctx, propertyName);\n      }\n    }\n\n    // Override the getError function with one that returns our saved results.\n    wrapper.getError = function () {\n      for (var err in glErrorShadow) {\n        if (glErrorShadow.hasOwnProperty(err)) {\n          if (glErrorShadow[err]) {\n            glErrorShadow[err] = false;\n            return err;\n          }\n        }\n      }\n      return ctx.NO_ERROR;\n    };\n\n    return wrapper;\n  }\n\n  function resetToInitialState(ctx) {\n    var isWebGL2RenderingContext = !!ctx.createTransformFeedback;\n\n    if (isWebGL2RenderingContext) {\n      ctx.bindVertexArray(null);\n    }\n\n    var numAttribs = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS);\n    var tmp = ctx.createBuffer();\n    ctx.bindBuffer(ctx.ARRAY_BUFFER, tmp);\n    for (var ii = 0; ii < numAttribs; ++ii) {\n      ctx.disableVertexAttribArray(ii);\n      ctx.vertexAttribPointer(ii, 4, ctx.FLOAT, false, 0, 0);\n      ctx.vertexAttrib1f(ii, 0);\n      if (isWebGL2RenderingContext) {\n        ctx.vertexAttribDivisor(ii, 0);\n      }\n    }\n    ctx.deleteBuffer(tmp);\n\n    var numTextureUnits = ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS);\n    for (var ii = 0; ii < numTextureUnits; ++ii) {\n      ctx.activeTexture(ctx.TEXTURE0 + ii);\n      ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, null);\n      ctx.bindTexture(ctx.TEXTURE_2D, null);\n      if (isWebGL2RenderingContext) {\n        ctx.bindTexture(ctx.TEXTURE_2D_ARRAY, null);\n        ctx.bindTexture(ctx.TEXTURE_3D, null);\n        ctx.bindSampler(ii, null);\n      }\n    }\n\n    ctx.activeTexture(ctx.TEXTURE0);\n    ctx.useProgram(null);\n    ctx.bindBuffer(ctx.ARRAY_BUFFER, null);\n    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);\n    ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);\n    ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);\n    ctx.disable(ctx.BLEND);\n    ctx.disable(ctx.CULL_FACE);\n    ctx.disable(ctx.DEPTH_TEST);\n    ctx.disable(ctx.DITHER);\n    ctx.disable(ctx.SCISSOR_TEST);\n    ctx.blendColor(0, 0, 0, 0);\n    ctx.blendEquation(ctx.FUNC_ADD);\n    ctx.blendFunc(ctx.ONE, ctx.ZERO);\n    ctx.clearColor(0, 0, 0, 0);\n    ctx.clearDepth(1);\n    ctx.clearStencil(-1);\n    ctx.colorMask(true, true, true, true);\n    ctx.cullFace(ctx.BACK);\n    ctx.depthFunc(ctx.LESS);\n    ctx.depthMask(true);\n    ctx.depthRange(0, 1);\n    ctx.frontFace(ctx.CCW);\n    ctx.hint(ctx.GENERATE_MIPMAP_HINT, ctx.DONT_CARE);\n    ctx.lineWidth(1);\n    ctx.pixelStorei(ctx.PACK_ALIGNMENT, 4);\n    ctx.pixelStorei(ctx.UNPACK_ALIGNMENT, 4);\n    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);\n    ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\n    // TODO: Delete this IF.\n    if (ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL) {\n      ctx.pixelStorei(\n        ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL,\n        ctx.BROWSER_DEFAULT_WEBGL\n      );\n    }\n    ctx.polygonOffset(0, 0);\n    ctx.sampleCoverage(1, false);\n    ctx.scissor(0, 0, ctx.canvas.width, ctx.canvas.height);\n    ctx.stencilFunc(ctx.ALWAYS, 0, 0xffffffff);\n    ctx.stencilMask(0xffffffff);\n    ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);\n    ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);\n    ctx.clear(\n      ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT\n    );\n\n    if (isWebGL2RenderingContext) {\n      ctx.drawBuffers([ctx.BACK]);\n      ctx.readBuffer(ctx.BACK);\n      ctx.bindBuffer(ctx.COPY_READ_BUFFER, null);\n      ctx.bindBuffer(ctx.COPY_WRITE_BUFFER, null);\n      ctx.bindBuffer(ctx.PIXEL_PACK_BUFFER, null);\n      ctx.bindBuffer(ctx.PIXEL_UNPACK_BUFFER, null);\n      var numTransformFeedbacks = ctx.getParameter(\n        ctx.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS\n      );\n      for (var ii = 0; ii < numTransformFeedbacks; ++ii) {\n        ctx.bindBufferBase(ctx.TRANSFORM_FEEDBACK_BUFFER, ii, null);\n      }\n      var numUBOs = ctx.getParameter(ctx.MAX_UNIFORM_BUFFER_BINDINGS);\n      for (var ii = 0; ii < numUBOs; ++ii) {\n        ctx.bindBufferBase(ctx.UNIFORM_BUFFER, ii, null);\n      }\n      ctx.disable(ctx.RASTERIZER_DISCARD);\n      ctx.pixelStorei(ctx.UNPACK_IMAGE_HEIGHT, 0);\n      ctx.pixelStorei(ctx.UNPACK_SKIP_IMAGES, 0);\n      ctx.pixelStorei(ctx.UNPACK_ROW_LENGTH, 0);\n      ctx.pixelStorei(ctx.UNPACK_SKIP_ROWS, 0);\n      ctx.pixelStorei(ctx.UNPACK_SKIP_PIXELS, 0);\n      ctx.pixelStorei(ctx.PACK_ROW_LENGTH, 0);\n      ctx.pixelStorei(ctx.PACK_SKIP_ROWS, 0);\n      ctx.pixelStorei(ctx.PACK_SKIP_PIXELS, 0);\n      ctx.hint(ctx.FRAGMENT_SHADER_DERIVATIVE_HINT, ctx.DONT_CARE);\n    }\n\n    // TODO: This should NOT be needed but Firefox fails with 'hint'\n    while (ctx.getError());\n  }\n\n  function makeLostContextSimulatingCanvas(canvas) {\n    var unwrappedContext_;\n    var wrappedContext_;\n    var onLost_ = [];\n    var onRestored_ = [];\n    var wrappedContext_ = {};\n    var contextId_ = 1;\n    var contextLost_ = false;\n    var resourceId_ = 0;\n    var resourceDb_ = [];\n    var numCallsToLoseContext_ = 0;\n    var numCalls_ = 0;\n    var canRestore_ = false;\n    var restoreTimeout_ = 0;\n    var isWebGL2RenderingContext;\n\n    // Holds booleans for each GL error so can simulate errors.\n    var glErrorShadow_ = {};\n\n    canvas.getContext = (function (f) {\n      return function () {\n        var ctx = f.apply(canvas, arguments);\n        // Did we get a context and is it a WebGL context?\n        if (\n          ctx instanceof WebGLRenderingContext ||\n          (window.WebGL2RenderingContext &&\n            ctx instanceof WebGL2RenderingContext)\n        ) {\n          if (ctx != unwrappedContext_) {\n            if (unwrappedContext_) {\n              throw 'got different context';\n            }\n            isWebGL2RenderingContext =\n              window.WebGL2RenderingContext &&\n              ctx instanceof WebGL2RenderingContext;\n            unwrappedContext_ = ctx;\n            wrappedContext_ =\n              makeLostContextSimulatingContext(unwrappedContext_);\n          }\n          return wrappedContext_;\n        }\n        return ctx;\n      };\n    })(canvas.getContext);\n\n    function wrapEvent(listener) {\n      if (typeof listener == 'function') {\n        return listener;\n      } else {\n        return function (info) {\n          listener.handleEvent(info);\n        };\n      }\n    }\n\n    var addOnContextLostListener = function (listener) {\n      onLost_.push(wrapEvent(listener));\n    };\n\n    var addOnContextRestoredListener = function (listener) {\n      onRestored_.push(wrapEvent(listener));\n    };\n\n    function wrapAddEventListener(canvas) {\n      var f = canvas.addEventListener;\n      canvas.addEventListener = function (type, listener, bubble) {\n        switch (type) {\n          case 'webglcontextlost':\n            addOnContextLostListener(listener);\n            break;\n          case 'webglcontextrestored':\n            addOnContextRestoredListener(listener);\n            break;\n          default:\n            f.apply(canvas, arguments);\n        }\n      };\n    }\n\n    wrapAddEventListener(canvas);\n\n    canvas.loseContext = function () {\n      if (!contextLost_) {\n        contextLost_ = true;\n        numCallsToLoseContext_ = 0;\n        ++contextId_;\n        while (unwrappedContext_.getError());\n        clearErrors();\n        glErrorShadow_[unwrappedContext_.CONTEXT_LOST_WEBGL] = true;\n        var event = makeWebGLContextEvent('context lost');\n        var callbacks = onLost_.slice();\n        setTimeout(function () {\n          //log(\"numCallbacks:\" + callbacks.length);\n          for (var ii = 0; ii < callbacks.length; ++ii) {\n            //log(\"calling callback:\" + ii);\n            callbacks[ii](event);\n          }\n          if (restoreTimeout_ >= 0) {\n            setTimeout(function () {\n              canvas.restoreContext();\n            }, restoreTimeout_);\n          }\n        }, 0);\n      }\n    };\n\n    canvas.restoreContext = function () {\n      if (contextLost_) {\n        if (onRestored_.length) {\n          setTimeout(function () {\n            if (!canRestore_) {\n              throw 'can not restore. webglcontestlost listener did not call event.preventDefault';\n            }\n            freeResources();\n            resetToInitialState(unwrappedContext_);\n            contextLost_ = false;\n            numCalls_ = 0;\n            canRestore_ = false;\n            var callbacks = onRestored_.slice();\n            var event = makeWebGLContextEvent('context restored');\n            for (var ii = 0; ii < callbacks.length; ++ii) {\n              callbacks[ii](event);\n            }\n          }, 0);\n        }\n      }\n    };\n\n    canvas.loseContextInNCalls = function (numCalls) {\n      if (contextLost_) {\n        throw 'You can not ask a lost contet to be lost';\n      }\n      numCallsToLoseContext_ = numCalls_ + numCalls;\n    };\n\n    canvas.getNumCalls = function () {\n      return numCalls_;\n    };\n\n    canvas.setRestoreTimeout = function (timeout) {\n      restoreTimeout_ = timeout;\n    };\n\n    function isWebGLObject(obj) {\n      //return false;\n      return (\n        obj instanceof WebGLBuffer ||\n        obj instanceof WebGLFramebuffer ||\n        obj instanceof WebGLProgram ||\n        obj instanceof WebGLRenderbuffer ||\n        obj instanceof WebGLShader ||\n        obj instanceof WebGLTexture\n      );\n    }\n\n    function checkResources(args) {\n      for (var ii = 0; ii < args.length; ++ii) {\n        var arg = args[ii];\n        if (isWebGLObject(arg)) {\n          return arg.__webglDebugContextLostId__ == contextId_;\n        }\n      }\n      return true;\n    }\n\n    function clearErrors() {\n      var k = Object.keys(glErrorShadow_);\n      for (var ii = 0; ii < k.length; ++ii) {\n        delete glErrorShadow_[k[ii]];\n      }\n    }\n\n    function loseContextIfTime() {\n      ++numCalls_;\n      if (!contextLost_) {\n        if (numCallsToLoseContext_ == numCalls_) {\n          canvas.loseContext();\n        }\n      }\n    }\n\n    // Makes a function that simulates WebGL when out of context.\n    function makeLostContextFunctionWrapper(ctx, functionName) {\n      var f = ctx[functionName];\n      return function () {\n        // log(\"calling:\" + functionName);\n        // Only call the functions if the context is not lost.\n        loseContextIfTime();\n        if (!contextLost_) {\n          //if (!checkResources(arguments)) {\n          //  glErrorShadow_[wrappedContext_.INVALID_OPERATION] = true;\n          //  return;\n          //}\n          var result = f.apply(ctx, arguments);\n          return result;\n        }\n      };\n    }\n\n    function freeResources() {\n      for (var ii = 0; ii < resourceDb_.length; ++ii) {\n        var resource = resourceDb_[ii];\n        if (resource instanceof WebGLBuffer) {\n          unwrappedContext_.deleteBuffer(resource);\n        } else if (resource instanceof WebGLFramebuffer) {\n          unwrappedContext_.deleteFramebuffer(resource);\n        } else if (resource instanceof WebGLProgram) {\n          unwrappedContext_.deleteProgram(resource);\n        } else if (resource instanceof WebGLRenderbuffer) {\n          unwrappedContext_.deleteRenderbuffer(resource);\n        } else if (resource instanceof WebGLShader) {\n          unwrappedContext_.deleteShader(resource);\n        } else if (resource instanceof WebGLTexture) {\n          unwrappedContext_.deleteTexture(resource);\n        } else if (isWebGL2RenderingContext) {\n          if (resource instanceof WebGLQuery) {\n            unwrappedContext_.deleteQuery(resource);\n          } else if (resource instanceof WebGLSampler) {\n            unwrappedContext_.deleteSampler(resource);\n          } else if (resource instanceof WebGLSync) {\n            unwrappedContext_.deleteSync(resource);\n          } else if (resource instanceof WebGLTransformFeedback) {\n            unwrappedContext_.deleteTransformFeedback(resource);\n          } else if (resource instanceof WebGLVertexArrayObject) {\n            unwrappedContext_.deleteVertexArray(resource);\n          }\n        }\n      }\n    }\n\n    function makeWebGLContextEvent(statusMessage) {\n      return {\n        statusMessage: statusMessage,\n        preventDefault: function () {\n          canRestore_ = true;\n        },\n      };\n    }\n\n    return canvas;\n\n    function makeLostContextSimulatingContext(ctx) {\n      // copy all functions and properties to wrapper\n      for (var propertyName in ctx) {\n        if (typeof ctx[propertyName] == 'function') {\n          wrappedContext_[propertyName] = makeLostContextFunctionWrapper(\n            ctx,\n            propertyName\n          );\n        } else {\n          makePropertyWrapper(wrappedContext_, ctx, propertyName);\n        }\n      }\n\n      // Wrap a few functions specially.\n      wrappedContext_.getError = function () {\n        loseContextIfTime();\n        if (!contextLost_) {\n          var err;\n          while ((err = unwrappedContext_.getError())) {\n            glErrorShadow_[err] = true;\n          }\n        }\n        for (var err in glErrorShadow_) {\n          if (glErrorShadow_[err]) {\n            delete glErrorShadow_[err];\n            return err;\n          }\n        }\n        return wrappedContext_.NO_ERROR;\n      };\n\n      var creationFunctions = [\n        'createBuffer',\n        'createFramebuffer',\n        'createProgram',\n        'createRenderbuffer',\n        'createShader',\n        'createTexture',\n      ];\n      if (isWebGL2RenderingContext) {\n        creationFunctions.push(\n          'createQuery',\n          'createSampler',\n          'fenceSync',\n          'createTransformFeedback',\n          'createVertexArray'\n        );\n      }\n      for (var ii = 0; ii < creationFunctions.length; ++ii) {\n        var functionName = creationFunctions[ii];\n        wrappedContext_[functionName] = (function (f) {\n          return function () {\n            loseContextIfTime();\n            if (contextLost_) {\n              return null;\n            }\n            var obj = f.apply(ctx, arguments);\n            obj.__webglDebugContextLostId__ = contextId_;\n            resourceDb_.push(obj);\n            return obj;\n          };\n        })(ctx[functionName]);\n      }\n\n      var functionsThatShouldReturnNull = [\n        'getActiveAttrib',\n        'getActiveUniform',\n        'getBufferParameter',\n        'getContextAttributes',\n        'getAttachedShaders',\n        'getFramebufferAttachmentParameter',\n        'getParameter',\n        'getProgramParameter',\n        'getProgramInfoLog',\n        'getRenderbufferParameter',\n        'getShaderParameter',\n        'getShaderInfoLog',\n        'getShaderSource',\n        'getTexParameter',\n        'getUniform',\n        'getUniformLocation',\n        'getVertexAttrib',\n      ];\n      if (isWebGL2RenderingContext) {\n        functionsThatShouldReturnNull.push(\n          'getInternalformatParameter',\n          'getQuery',\n          'getQueryParameter',\n          'getSamplerParameter',\n          'getSyncParameter',\n          'getTransformFeedbackVarying',\n          'getIndexedParameter',\n          'getUniformIndices',\n          'getActiveUniforms',\n          'getActiveUniformBlockParameter',\n          'getActiveUniformBlockName'\n        );\n      }\n      for (var ii = 0; ii < functionsThatShouldReturnNull.length; ++ii) {\n        var functionName = functionsThatShouldReturnNull[ii];\n        wrappedContext_[functionName] = (function (f) {\n          return function () {\n            loseContextIfTime();\n            if (contextLost_) {\n              return null;\n            }\n            return f.apply(ctx, arguments);\n          };\n        })(wrappedContext_[functionName]);\n      }\n\n      var isFunctions = [\n        'isBuffer',\n        'isEnabled',\n        'isFramebuffer',\n        'isProgram',\n        'isRenderbuffer',\n        'isShader',\n        'isTexture',\n      ];\n      if (isWebGL2RenderingContext) {\n        isFunctions.push(\n          'isQuery',\n          'isSampler',\n          'isSync',\n          'isTransformFeedback',\n          'isVertexArray'\n        );\n      }\n      for (var ii = 0; ii < isFunctions.length; ++ii) {\n        var functionName = isFunctions[ii];\n        wrappedContext_[functionName] = (function (f) {\n          return function () {\n            loseContextIfTime();\n            if (contextLost_) {\n              return false;\n            }\n            return f.apply(ctx, arguments);\n          };\n        })(wrappedContext_[functionName]);\n      }\n\n      wrappedContext_.checkFramebufferStatus = (function (f) {\n        return function () {\n          loseContextIfTime();\n          if (contextLost_) {\n            return wrappedContext_.FRAMEBUFFER_UNSUPPORTED;\n          }\n          return f.apply(ctx, arguments);\n        };\n      })(wrappedContext_.checkFramebufferStatus);\n\n      wrappedContext_.getAttribLocation = (function (f) {\n        return function () {\n          loseContextIfTime();\n          if (contextLost_) {\n            return -1;\n          }\n          return f.apply(ctx, arguments);\n        };\n      })(wrappedContext_.getAttribLocation);\n\n      wrappedContext_.getVertexAttribOffset = (function (f) {\n        return function () {\n          loseContextIfTime();\n          if (contextLost_) {\n            return 0;\n          }\n          return f.apply(ctx, arguments);\n        };\n      })(wrappedContext_.getVertexAttribOffset);\n\n      wrappedContext_.isContextLost = function () {\n        return contextLost_;\n      };\n\n      if (isWebGL2RenderingContext) {\n        wrappedContext_.getFragDataLocation = (function (f) {\n          return function () {\n            loseContextIfTime();\n            if (contextLost_) {\n              return -1;\n            }\n            return f.apply(ctx, arguments);\n          };\n        })(wrappedContext_.getFragDataLocation);\n\n        wrappedContext_.clientWaitSync = (function (f) {\n          return function () {\n            loseContextIfTime();\n            if (contextLost_) {\n              return wrappedContext_.WAIT_FAILED;\n            }\n            return f.apply(ctx, arguments);\n          };\n        })(wrappedContext_.clientWaitSync);\n\n        wrappedContext_.getUniformBlockIndex = (function (f) {\n          return function () {\n            loseContextIfTime();\n            if (contextLost_) {\n              return wrappedContext_.INVALID_INDEX;\n            }\n            return f.apply(ctx, arguments);\n          };\n        })(wrappedContext_.getUniformBlockIndex);\n      }\n\n      return wrappedContext_;\n    }\n  }\n\n  return {\n    /**\n     * Initializes this module. Safe to call more than once.\n     * @param {!WebGLRenderingContext} ctx A WebGL context. If\n     *    you have more than one context it doesn't matter which one\n     *    you pass in, it is only used to pull out constants.\n     */\n    init: init,\n\n    /**\n     * Returns true or false if value matches any WebGL enum\n     * @param {*} value Value to check if it might be an enum.\n     * @return {boolean} True if value matches one of the WebGL defined enums\n     */\n    mightBeEnum: mightBeEnum,\n\n    /**\n     * Gets an string version of an WebGL enum.\n     *\n     * Example:\n     *   WebGLDebugUtil.init(ctx);\n     *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());\n     *\n     * @param {number} value Value to return an enum for\n     * @return {string} The string version of the enum.\n     */\n    glEnumToString: glEnumToString,\n\n    /**\n     * Converts the argument of a WebGL function to a string.\n     * Attempts to convert enum arguments to strings.\n     *\n     * Example:\n     *   WebGLDebugUtil.init(ctx);\n     *   var str = WebGLDebugUtil.glFunctionArgToString('bindTexture', 2, 0, gl.TEXTURE_2D);\n     *\n     * would return 'TEXTURE_2D'\n     *\n     * @param {string} functionName the name of the WebGL function.\n     * @param {number} numArgs The number of arguments\n     * @param {number} argumentIndx the index of the argument.\n     * @param {*} value The value of the argument.\n     * @return {string} The value as a string.\n     */\n    glFunctionArgToString: glFunctionArgToString,\n\n    /**\n     * Converts the arguments of a WebGL function to a string.\n     * Attempts to convert enum arguments to strings.\n     *\n     * @param {string} functionName the name of the WebGL function.\n     * @param {number} args The arguments.\n     * @return {string} The arguments as a string.\n     */\n    glFunctionArgsToString: glFunctionArgsToString,\n\n    /**\n     * Given a WebGL context returns a wrapped context that calls\n     * gl.getError after every command and calls a function if the\n     * result is not NO_ERROR.\n     *\n     * You can supply your own function if you want. For example, if you'd like\n     * an exception thrown on any GL error you could do this\n     *\n     *    function throwOnGLError(err, funcName, args) {\n     *      throw WebGLDebugUtils.glEnumToString(err) +\n     *            \" was caused by call to \" + funcName;\n     *    };\n     *\n     *    ctx = WebGLDebugUtils.makeDebugContext(\n     *        canvas.getContext(\"webgl\"), throwOnGLError);\n     *\n     * @param {!WebGLRenderingContext} ctx The webgl context to wrap.\n     * @param {!function(err, funcName, args): void} opt_onErrorFunc The function\n     *     to call when gl.getError returns an error. If not specified the default\n     *     function calls console.log with a message.\n     * @param {!function(funcName, args): void} opt_onFunc The\n     *     function to call when each webgl function is called. You\n     *     can use this to log all calls for example.\n     */\n    makeDebugContext: makeDebugContext,\n\n    /**\n     * Given a canvas element returns a wrapped canvas element that will\n     * simulate lost context. The canvas returned adds the following functions.\n     *\n     * loseContext:\n     *   simulates a lost context event.\n     *\n     * restoreContext:\n     *   simulates the context being restored.\n     *\n     * lostContextInNCalls:\n     *   loses the context after N gl calls.\n     *\n     * getNumCalls:\n     *   tells you how many gl calls there have been so far.\n     *\n     * setRestoreTimeout:\n     *   sets the number of milliseconds until the context is restored\n     *   after it has been lost. Defaults to 0. Pass -1 to prevent\n     *   automatic restoring.\n     *\n     * @param {!Canvas} canvas The canvas element to wrap.\n     */\n    makeLostContextSimulatingCanvas: makeLostContextSimulatingCanvas,\n\n    /**\n     * Resets a context to the initial state.\n     * @param {!WebGLRenderingContext} ctx The webgl context to\n     *     reset.\n     */\n    resetToInitialState: resetToInitialState,\n  };\n})();\n\n\n//# sourceURL=webpack://earthquest/./src/utilities/webgl-debug.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return undefined;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "earthquest:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"debug": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						} else installedChunks[chunkId] = 0;
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkearthquest"] = self["webpackChunkearthquest"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/utilities/webgl-debug.js");
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;