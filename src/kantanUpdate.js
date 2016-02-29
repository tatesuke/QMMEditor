kantanUpdate({
	"newVersion": "<inline src="kantanVersion.txt" />",
	"ktmString": <inline src="ktmString.js" />,
	"doUpdate": function() {
		var kantanVersion = document.getElementById("kantanVersion").value;
		if (kantanVersion == this.newVersion) {
			alert("お使いのKantanMarkdownは最新です。アップデートの必要はありません。");
			return;
		}
		
		showImportDialog(
				"アップデートを適用できます。\n" +
				"\n" +
				"現在ご利用のバージョン: " + kantanVersion + "\n" +
				"新しいバージョン　　　: " + this.newVersion + "\n" +
				"\n" + 
				"新バージョンに引き継ぐ項目を選んでください。", (function (parent) {

			return function(result) {
				if (result.result == true) {
					parent.rewirteHtml(result);
				}
			}
		})(this));
	},
	"rewirteHtml":function(dialogResult) {
		// アップデート前の値を記憶しておく
		var fileListElement = document.querySelector("ul#fileList");
		var originalMarkdown = document.querySelector("textarea#editor").value;
		
		// エディションを読み込み
		var kantanEdition = document.querySelector("#kantanEdition").value;
		
		// メモリリーク対策のためにイベントをすべて消す。
		removeAllEvents();
		
		// liteエディションではhljsのcssを消す
		var newHtml = this.ktmString;
		if (kantanEdition == "lite") {
			newHtml = newHtml.replace(/\/\* START_HLJS_CSS \*\/[\s|\S]+\/\* END_HLJS_CSS \*\//, "");
		}
		
		// 本体をアップデート
		var html = document.querySelector("html");
		html.innerHTML = newHtml;
		
		// バージョン・エディション更新
		updateKantanVersion(this.newVersion);
		updateKantanEdition(kantanEdition);
		
		// innerHTMLではscriptタグが実行されないのでいったん外して付け直す
		var scriptElements = document.querySelectorAll("script");
		for (var i = 0; i < scriptElements.length; i++) {
			var scriptElement = scriptElements[i];
			var parentNode = scriptElement.parentNode;
			parentNode.removeChild(scriptElement);
		}
		for (var i = 0; i < scriptElements.length; i++) {
			var scriptElement = scriptElements[i];
			if (kantanEdition == "lite" &&
					(  (scriptElement.id == "highlightJs")
					|| (scriptElement.id == "raphaelJs")
					|| (scriptElement.id == "underscoreJs")
					|| (scriptElement.id == "jsSequenceDiagramsJs")
					|| (scriptElement.id == "flowchartJs") )) {
				continue;
			} else if (kantanEdition == "std" && 
					(  (scriptElement.id == "raphaelJs")
					|| (scriptElement.id == "underscoreJs")
					|| (scriptElement.id == "jsSequenceDiagramsJs")
					|| (scriptElement.id == "flowchartJs") )) {
				continue;
			}
			var newScript = document.createElement("script");
			newScript.id = scriptElement.id;
			newScript.innerHTML = scriptElement.innerHTML;
			
			document.querySelector("body").appendChild(newScript);
		}
		
		// 添付ファイル引継ぎ
		if (dialogResult.attach == true) {
			var fileList = document.getElementById("fileList");
			var importScripts = fileListElement.querySelectorAll("script");
			for (var i = 0; i < importScripts.length; i++) {
				var scriptElement = importScripts[i];
				var fileName = scriptElement.title;
				var content = scriptElement.innerHTML;
				addAttachFileElements(fileName, content);
			}
			saved = false;
		}
		
		// Markdown引継ぎ
		if (dialogResult.markdown == true) {
			var editor = document.getElementById("editor");
			editor.value = originalMarkdown;
			saved = false;
		}
		
		// 念のため古いエレメントを削除しておく
		fileListElement = null;
		
		// プレビュー
		doPreview();
		
		alert("アップデートが完了しました。");
	},
});