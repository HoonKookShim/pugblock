/*
	pugblock.mjs

*/

import pug from 'pug';

class PugBlock extends Array {

	constructor(srcStr) {
		super();
		this.blockBox = {};
		this.curDepth = 0;

		if(srcStr) this.addLines(srcStr);
	}
	
	include(blockName, target) {
		if(typeof target === 'string') this.blockBox[blockName] = new PugBlock(target);
		else if(target instanceof PugBlock) this.blockBox[blockName] = target;
		else throw new Error('Invalid includes. Include text or a PugBlock instance only.');
		return this;
	}

	addLines(srcStr) {
		let srcLines = srcStr.split('\n');
		for(let curLine of srcLines) {
			if(curLine) this.push(this.parseLine(curLine, this.curDepth));
			else this.push(new PugLine(0, PugLine.EPT, ''));
		}
		return this;
	}

	incDepth() {
		this.curDepth++;
		return this;
	}

	decDepth() {
		if(this.curDepth === 0) throw new Error('Current depth is 0. Cannot be outdented more.');
		this.curDepth--;
		return this;
	}

	/*
		combine() generated a new PugBlock instance, whose depth is 0.
		'Depth is 0' means that they have no other PugBlock instance in the this.blockBox,
			so all other PugBlock instances included in the this PugBlock is converted to PugLines.

		In case there is a  PugLine which says that need a PugBlock but there is no corresponding block in blockBox,
			combine() just keep  in the PugLines as a block, not a string,
			for further inclusion.
		combine() function is generally called right before including final block, for instance 'content' block of a layout.
	*/
	combine(baseDepth = 0) {
		let resultBlock = new PugBlock();

		for(let curLine of this) {
			if(curLine.elementType === PugLine.STR)
				resultBlock.push(new PugLine(curLine.depth + baseDepth, PugLine.STR, curLine.element));
			else if(curLine.elementType === PugLine.BLK) {
				if(this.blockBox[curLine.element]) {
					let block2ins = this.blockBox[curLine.element].combine(curLine.depth + baseDepth);
					for(let aPugLine of block2ins) resultBlock.push(aPugLine);
				}
				else resultBlock.push(new PugLine(curLine.depth + baseDepth, PugLine.BLK, curLine.element));
			}
			else resultBlock.push(new PugLine(0, PugLine.EPT, ''));
		}
		return resultBlock;
	}

	compile(options) {
		return pug.compile(this.toString(), options);
	}

	/*
		toString() returns final text pug strings generated from this PugBlock instance.
		Befor toString() is called, all the blocks declared in the template should be included.
		Otherwise toString() throws an error.
	*/
	toString() {
		let combinedThis = this.combine();

		let resultPug = [];
		
		for(let curLine of combinedThis) {
			if(curLine.elementType === PugLine.BLK) throw new Error(`Block ${curLine.element} doesn't exist.`);
			if(curLine.elementType === PugLine.STR) resultPug.push(this.padTabs(curLine.depth) + curLine.element);
			else resultPug.push('');
		}
		
		return resultPug.join('\n');
	}

	/*
		parseLine() returns:
			if empty line: a PugLine instance whose elementType is 'EPT',
			if starts with '*': a PugLine instance whose elementType is 'BLK',
			if starts with other than '*': a PugLine instance whose elementType is 'STR'.
	*/
	parseLine(srcLine, baseDepth = 0) {
		for(let index = 0; index < srcLine.length; index++)  {
			if(srcLine.charAt(index) != '\t' && srcLine.charAt(index) != ' ') {
				if(srcLine.charAt(index) === '*') 
					return new PugLine(baseDepth + index, PugLine.BLK, srcLine.substring(index+1, srcLine.length));
				else return new PugLine(baseDepth + index, PugLine.STR, srcLine.substring(index, srcLine.length));
			}
		}
		return new PugLine(0, PugLine.EPT, '');

	}

	padTabs(depth) {
		let tabString = '';
		for(let i=0; i < depth; i++) tabString = tabString + '\t';
		return tabString;
	}
	
}

class PugLine {

	constructor(depth, elementType, element) {
		this.depth = depth;
		this.elementType = elementType;
		this.element = element;
	}

	static EPT = 0;
	static STR = 1;
	static BLK = 2;
	
}

export default PugBlock;
