adapt-search
============

Adapt plugin that takes 1 or more search terms and displays a list of blocks ranked by relevance of keywords

## How it works
Keywords are assigned to each block. The search query is matched against this list of keywords and a score is awarded to each block. Blocks are then ordered based on their search score. The search query words in the input box can be separated by commas or whitespace. The following sections provide a separate explanation for different disciplines....

## Designers
Keywords should describe the learning content of the block. The order of the keywords is important as more weighting is given to words at the start of the list. Also, the way the search algorithm works, a penalty is taken from the search score for keywords missed. A larger penalty is applied for keywords at the start of the list not matched by the search query. Put the most important keywords at the start of the list.

## Developers
Keywords are only assigned at the block level. Keywords are added in array format, in the metadata – keywords attribute for each block. The order of the keywords is important as more weighting is given to words at the start of the list. It is therefore important that keywords are added to the array in the same order as the designer has specified.

## Programmers
An explanation of the algorithm….
The search query is matched against the keywords listed for each block. Each block that has at least one matching keyword is ranked according to 3 criteria (in order): Search score, search penalty, and top ranked match index. These criteria are not cumulative – items are primarily marked on search score, In cases where this is equal for 2 or more blocks, these are then ranked according to which has the least search penalty. If still equal then precedence is given to blocks which have matched keywords higher up the list.
-	Search score. Keyword scoring is weighted to favour words listed at the start of the list. 1 point is awarded for matching the top ranked keyword. 0.9 is awarded for the 2nd, 0.8 for the 3rd, and so on until the 6th keyword which is awarded 0.5 points. All matched keywords after this are also awarded 0.5 points each
-	Search penalty. If a keyword in the block is not matched then a penalty is added. Again, weighting is dependent on the position of the unmatched keyword within the array. A penalty of 0.3 is given if the 1st item in the keywords array is unmatched. 0.2 points for the 2nd, 0.1 for the 3rd. 0.1 is awarded for each unmatched keyword thereafter.
-	Top ranked matched index. If the search score and search penalty for any blocks are both equal, then precedence is given to the block which has the highest rank matched keyword. 
If all 3 criteria are equal then the blocks are just ordered as they come. There isn’t any point trying to differentiate between them any further.

