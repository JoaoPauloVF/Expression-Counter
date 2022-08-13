//Elements
const expressionInput = document.getElementById('expression');
const runButton = document.getElementById('run-button');

/*
  getValidRegExp(expressionStr, flags, escapeAll):
    It returns a regular expression with error prevent and
    the option to escape all special chars.
*/
function getValidRegExp(expressionStr, flags, escapeAll) {
  if (escapeAll){ //Escape all special chars if true
    return new RegExp(expressionStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
  } else {
    try { //'\', '[', ']', '(',and ')' can cause syntax errors in regular expressions
      return new RegExp(expressionStr, flags);
    } catch { //Escape the above chars in case of error.
      return new RegExp(expressionStr.replace(/[\\\[\]()]/g, '\\$&'), flags);
    }
  }
}

/*
  count(text, expression): It returns the amount of an expression in a text.
*/
function count(text, expression) {
  const matchResult = text.match(expression);
  return matchResult ? matchResult.length : 0;
}

/*
  HTMLtoText (text, openingTag, closingTag): 
    It converts HTML code to text replacing '<' to '&lt;'.
    This only if the '<' isn't in a `<${openingTag}><${closingTag}>`.
*/
function HTMLtoText (text, openingTag, closingTag) {
  const formatRegExp = new RegExp(`<(.{${openingTag.length}})`, 'gs');

  let formatText = text;
   do {
    text = formatText;
    formatText = text.replace(formatRegExp, (match, group) => {
      if (group === openingTag || group.substr(0, closingTag.length) === closingTag) {
        return match;
      } else {
        return match.replace(/</, '&lt;');
      }
    });
  } while(formatText !== text);

  return text;
}
/*
  getHighlightedMacthes(text, regExp): 
    It returns the result text with the expression matches highlighted.

    There is a bug here: The user can control the highlight by typing the span
    tags (something like <span class="match">...</span>) in the text input. 
*/
function getHighlightedMacthes(text, regExp) {
  //Tags content for the matched expressions
  const openingTag = 'span class="match"';
  const closingTag = '/span';
  //Highlight the matches
  text = text.replace(regExp, `<${openingTag}>$&<${closingTag}>`);
  //Convert any '<' that isn't in the before span to plain text(see the above function).
  text = HTMLtoText(text, openingTag, closingTag);

  return text;
}
/*
  updateResults(): 
    It updates the #result and #highlighted-matches elements.
    The first with the count result and the second with the text with
    the matches highlighted.
*/
function updateResults() {
  //Output/result elements
  const countResult = document.getElementById('result');
  const highlightedMatches = document.getElementById('highlighted-matches');

  //Inputs content
  const text = document.getElementById('text').value;
  const strExp = document.getElementById('expression').value;

  //Page checkboxes
  const useRegExp = document.getElementById('use-reg-exp').checked;
  const ignoreCase = document.getElementById('ignore-case').checked;

  //Create regExp
  let flags = ignoreCase ? 'gi': 'g';
  const regExp = getValidRegExp(strExp, flags, !useRegExp);

  if (strExp) { //strExp is not empty
    let formatExp = useRegExp ? regExp: `"${strExp}"`;

    countResult.innerText = `${formatExp} was found ${count(text, regExp)} in the text:`;
    highlightedMatches.innerHTML = getHighlightedMacthes(text, regExp);
  } else { //strExp is empty
    countResult.innerText = 'Fill the "Expression" field';
    highlightedMatches.innerHTML = '';
  }  
}

/*
  moveResults():
    It moves the #result and the #highlighted-matches from
    .item1 to .item2 when the screen is smaller than 800 pixels.
*/
function moveResults() {
  const item1 = document.querySelector('.item1'); //Text input
  const item2 = document.querySelector('.item2'); //Expression input and searching settings

  const result = document.getElementById('result');
  const highlightedMatches = document.getElementById('highlighted-matches');

  if(window.innerWidth <= 800) { //800 is the max-width in the first media query in style.css file
    item2.append(result);
    item2.append(highlightedMatches);
  } else {
    item1.append(result);
    item1.append(highlightedMatches);
  }
}

//Events listeners
window.addEventListener('load', moveResults);
window.addEventListener('resize', moveResults);

runButton.addEventListener('click', updateResults);
expressionInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    updateResults();
  }
});