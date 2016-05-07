// get index of the first sub array by value, regardless the same reference or not
Array.prototype.indexOfSubArray = function (arr) {
	for (var i = 0; i < this.length; i++) {
	    if (Array.isArray(this[i]) && this[i].equals(arr))
	        return i;
	}
	return -1;  // not founded
};
Array.prototype.equals = function (arr) {
	if (Array.isArray(arr)) {
	    if (this === arr) return true;
	    if (this.length !== arr.length) return false;
	    for (var i = 0; i < this.length; i++)
	        if (this[i] !== arr[i]) return false;
	    return true;
	}
	return false;
};
// get counts of val (strict equality) in this Array
Array.prototype.countsOf = function (val) {
	var count = 0;
	this.forEach(function (d) {
	    if (d === val) count++;
	});
	return count;
};
