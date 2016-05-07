require.config({
	baseUrl: "",
	paths: {
		svg: "https://cdnjs.cloudflare.com/ajax/libs/svg.js/2.3.0/svg.min",
		settings: "settings",
		js_extension:"js_extension",
		gobang: "gobang"
	},
	waitSeconds: 15
});
require(["gobang"], function(gobang) {
	gobang.start("gameboard");
});
