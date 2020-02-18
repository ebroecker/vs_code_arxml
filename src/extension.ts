// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';
import * as sax from 'sax';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('arxml is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.arxml', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Arxml starts parsing!');
	});
//	vscode.languages.registerHoverProvider('xml', {
//		provideHover(document, position, token) {
//		  return {
//			contents: ['Hover Content']
//		  };
//		} });
//	vscode.languages.registerReferenceProvider('xml', {
//	   provideReferences(document, position, options, token)//
//	    {
//	   return [];
//	}	});
	const links_registration = vscode.languages.registerDocumentLinkProvider("xml", _linkProvider);
	// context.subscriptions.push(disposable);
	context.subscriptions.push(links_registration);
	context.subscriptions.push(disposable);
}

const _linkProvider = new class implements vscode.DocumentLinkProvider {
	async provideDocumentLinks(document: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.DocumentLink[]>
	{

	   var text = document.getText();
	   const parser = new sax.SAXParser(true, {});
	   var inshortname = false;
	   var  ar_path = Array<string>();
	   var ar_path_deepth = Array<number>();
	   var current_depth = 0;

	   var dict: { [id: string]: vscode.Uri; } = {};

	   var re = RegExp("-REF +DEST=.*<");
	   var match = re.exec(text);
	   var current_index = 0;
	   let temp = [];

	   parser.onopentag = function (node) {
		   current_depth ++;
		   if (node.name === "SHORT-NAME")
		   {
			   inshortname = true;
		   }
		   else
		   {
			   inshortname = false;
		   }
	   };

	   parser.ontext = function (t) {
		   if(inshortname === true)
		   {
			   while(current_depth <= ar_path_deepth[ar_path_deepth.length-1])
			   {
				   ar_path.pop();
				   ar_path_deepth.pop();
			   }
			   ar_path.push(t);
			   ar_path_deepth.push(current_depth);
			   var pos = document.positionAt(parser.startTagPosition);
			   dict[ar_path.join("/")] = document.uri.with({fragment: `${pos.line+1}:${pos.character - t.length}`});
		   }
	   };

	   parser.onclosetag = function (node) {
		   inshortname = false;
		   current_depth --;

	   };
	   parser.write(text);


	   while(match)
	   {
		   current_index += match.index ;
		   var start_pos = document.positionAt(current_index + match[0].indexOf(">") + 1);
		   var end_pos = document.positionAt(current_index + match[0].length - 1);

		   var link_key = match[0].substr(match[0].indexOf(">") + 2, match[0].length - match[0].indexOf(">") - 3);

		   temp.push(new vscode.DocumentLink(new vscode.Range( start_pos, end_pos), dict[link_key]));
		   text = text.substr(match.index + 5);
		   current_index += 5;
		   match = re.exec(text);
	   }

		return temp;
	}
};


// this method is called when your extension is deactivated
export function deactivate() {}
