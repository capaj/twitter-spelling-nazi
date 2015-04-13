import {customElement, bindable} from 'aurelia-framework';

@customElement('tweet')
export class Tweet {
	@bindable data;

	htmlDecode(input){
		var e = document.createElement('div');
		e.innerHTML = input;
		return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
	}
}