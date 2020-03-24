var convert = require("../lib/convertUtil");

describe("convertUtil", function () {
	describe("getInjectedContents", function () {
		var sampleScriptContent = "<script>\n\tconsole.log(\"test\");\n</script>\n";
		var sampleStyleContent = "<style type=\"text/css\">\n" +
			"\tbody{\n" +
			"\t\toverflow: hidden;\n" +
			"\t}\n" +
			"</style>\n";

		it("can get file content", function () {
			var existFileContents = convert.getInjectedContents(
				__dirname,
				["fixture/innerhtml/sample_script.html"]
			);
			expect(existFileContents.length).toBe(1);
			expect(existFileContents[0]).toBe(sampleScriptContent);
		});
		it("can get file contents in specified directory", function () {
			var existFileContents = convert.getInjectedContents(__dirname, ["fixture/innerhtml"]);
			expect(existFileContents.length).toBe(2);
			expect(existFileContents[0]).toBe(sampleScriptContent);
			expect(existFileContents[1]).toBe(sampleStyleContent);
		});
		it("can get file contents by specified order", function () {
			var existFileContents = convert.getInjectedContents(
				__dirname,
				["fixture/innerhtml/sample_style.html", "fixture/innerhtml/sample_script.html"]
			);
			expect(existFileContents.length).toBe(2);
			expect(existFileContents[0]).toBe(sampleStyleContent);
			expect(existFileContents[1]).toBe(sampleScriptContent);
		});
	});
	describe("validateEs5Code", function () {
		it("return empty array if code is written with ES5 syntax", function () {
			const es5Code = `
				"use strict";
				var fn = function () {
					return 1;
				};
				var array = [1, 2];
				var a = array[0];
				var b = array[1];
			`;
			expect(convert.validateEs5Code("es5.js", es5Code).length).toBe(0);
		});
		it("return error messages if code is not written with ES5 syntax", function () {
			const es6Code = `
				"use strict";
				const fn = () => {
					return 1;
				}
				const array = [1, 3];
				const [a, b] = array;
			`;
			const result = convert.validateEs5Code("es6.js", es6Code);
			expect(result.length).toBe(1);
			expect(result[0]).toBe("es6.js(3:5): Parsing error: The keyword \'const\' is reserved");
		});
	});
	describe("encodeText", function () {
		it("can encode specified characters and the characters can be decode", function () {
			var targetString = "";
			for (var i = 0; i < 128; i++) {
				targetString += String.fromCharCode(i);
			}
			targetString += "\u2028\u2029";
			targetString += "あいうえお";
			targetString += "１２３４５％＆’”";
			targetString += "漢字例";
			targetString += "○×";
			expect(decodeURIComponent(convert.encodeText(targetString))).toBe(targetString);
		});
	});
	describe("addUntaintedToImageAssets", function () {
		it("add 'untainted: true' to image asset on specified gamejson", function () {
			var gamejson = {
				"width": 320,
				"height": 320,
				"fps": 30,
				"main": "./script/main.js",
				"assets": {
					"main": {
						"type": "script",
						"path": "script/main.js",
						"global": true
					},
					"sample_image1": {
						"type": "image",
						"width": 150,
						"height": 149,
						"path": "image/sample_image1.png"
					},
					"sample_image2": {
						"type": "image",
						"width": 150,
						"height": 149,
						"path": "image/sample_image2.png"
					},
					"sample_text1": {
						"type": "text",
						"path": "texte/sample_text1.png"
					},
				}
			};
			convert.addUntaintedToImageAssets(gamejson);
			// ImageAssetには "untainted: true" が付与される
			expect(gamejson.assets.sample_image1.hint.untainted).toBeTruthy();
			expect(gamejson.assets.sample_image2.hint.untainted).toBeTruthy();
			// ImageAsset以外には "untainted: true" が付与されない
			expect(gamejson.assets.main.hint).toBeUndefined();
			expect(gamejson.assets.sample_text1.hint).toBeUndefined();
		});
	});
});
