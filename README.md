# Scrubbing-Speed-JS

ScrubbingSpeed.js is a variable scrubbing speed slider solution for web developers.

You can view an interactive sample and accompanying article at http://derekknox.com/articles/scrubbing-speed-js/#example-scrubbing-speed-js.

![Image](_assets/img/scrubbing-speed-sample.gif)

##Code Example
```html
<div class="scrubbing-speed-wrapper ss-spacer">
    <div class="scrubbing-speed-slider"
        data-ss-name="my-slider"
        data-ss-min="0"
        data-ss-max="100000"
        data-ss-color-fill="#AEEE00"
        data-ss-color-empty="#666"></div>
</div>
```
```javascript
ScrubbingSpeed.init('my-slider', function(args){ 
	/* use the args props here to update the UI, jump to video/audio, etc. */
	console.log(args.min);
	console.log(args.current);
	console.log(args.max);
	console.log(args.speed);
	console.log(args.percentX);
	console.log(args.percentY);
});
```

##License
	
	The MIT License (MIT)

	Copyright (c) 2015 Derek Knox | Braindrop Labs

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.

##Designed and Developed By
Derek Knox | Braindrop Labs