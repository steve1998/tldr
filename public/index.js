$(document).ready(function(){
    $("#submit").click(function(){
    	$("#answer").empty(); // ADD THIS IN!!!!
        var txtQuery = $("#text").val(); // gets data from input text

        var list;
		
        function addKeyword(name)
        {
          var span = '<li>' + '<span>' + name + '</li>' + '</span>';
          $("#listKeywords").append(span);
        }

        function highlightKeywords()
        {
          // this is the highlighting portion of the code 
          var sentences = document.querySelector('#newText');
          var keywords = document.querySelector('#keywords');
          
          keywords.addEventListener('click', function(event){
        var target = event.target;
          var text = sentences.textContent;
          
          var copyText = text;
          var targetLength = target.textContent.length;
          
          var index = copyText.search('('+target.textContent+')');
          
          while (copyText.length != 0)
          {
            target = event.target;
            index = copyText.search('('+target.textContent+')');
            if (index == -1)
            {
              break;
            }
          
            var startIndex = 0;
            var endIndex = 0;
            var numWhitespaceSeen = 0;
          
            // look backwards
            for(let i = index - 1; i >= 0; i--)
            {
              if (copyText[i] == ' ')
              {
                numWhitespaceSeen++;
              
                if (numWhitespaceSeen == 3)
                {
                  startIndex = i + 1;
                  break;
                }
              }
            
              if (copyText[i] == '.')
              {
                startIndex = i + 2;
                break;
              }
            }
          
            numWhitespaceSeen = 0;
          
            // look forward
            for(let j = index + targetLength; j < copyText.length; j++)
            {
              if (copyText[j] == ' ')
              {
                numWhitespaceSeen++;
                if (numWhitespaceSeen == 3)
                {
                  endIndex = j;
                  break;
                }
              }
            
              if (copyText[j] == '.')
              {
                endIndex = j;
                break;
              }
            }
          
            //console.log("startIndex: ", startIndex);
            //console.log("endIndex: ", endIndex);
          
            target = copyText.substring(startIndex, endIndex);
            copyText = copyText.substring(endIndex + 1);
            //console.log("target: ", target);
          var regex = new RegExp('('+target+')', 'ig');
          //console.log("regex: ", regex);
          text = text.replace(regex, '<span class="highlight">$1</span>');
          sentences.innerHTML = text;
        }
      }, false);
        }
		
        function startEntity() {
          gapi.client.init({
            'apiKey': 'AIzaSyCRVQxM14uTcSrVmjXSvPW_64CUqWHrKtA',
            'discoveryDocs': ['https://language.googleapis.com/$discovery/rest?version=v1']
          }).then(function() {
            return gapi.client.language.documents.analyzeEntities({
              // not sure how to put in a JSON object in here correctly
              'document': {
                        'type': 'PLAIN_TEXT',
                        'content': txtQuery
                     }
            });
          }).then(function(resp) { 
            // The following loop gets rid of duplicate entities in the resp.result array
            console.log("Initial entity list:");
            console.log(resp.result);
            for (let i = 0; i < resp.result.entities.length; i++) {
              console.log(i);
              var currentElementName = resp.result.entities[i].name;
              for (let j = i + 1; j < resp.result.entities.length; j++) {
                if (currentElementName == resp.result.entities[j].name) {
                  resp.result.entities.splice(j, 1);
                }
              }
            }

            // Sorts all entities by salience, greatest to smallest
            resp.result.entities.sort(function(a, b){return a - b});
            resp.result.entities.reverse();

            // The following creates a 2D array: an array of arrays where each individual
            // array contains the same type.
             console.log("After sorting and removing duplicates: ");
             //console.log(resp.result);
             var typeToEntities = new Array(new Array(resp.result.entities[0]));
             console.log(typeToEntities);
             for (let i = 1; i < resp.result.entities.length; i++) {
                console.log(i);
                currentEntity = resp.result.entities[i];
                // cycle through each interval of the array, to see if the type already exists
                var isTypeInArray = false;
                console.log(typeToEntities)
                for (let j = 0; j < typeToEntities.length; j++) {
                  console.log(j);
                  if (typeToEntities[j][0].type == currentEntity.type) {
                    console.log("is true");
                    typeToEntities[j].push(currentEntity);
                    isTypeInArray = true;
                    break;
                  } else {
                    continue;
                  }
                }
                if (!isTypeInArray) {
                  console.log("pushing new array");
                  typeToEntities.push(new Array(currentEntity));
                }
             }
             
			 // generating the list of key words
			 var keywordsDiv = '<div class="column is-one-third" id="keywords">' + '<ul id="listKeywords">' + '</ul>' + '</div>';
			 $("#answer").append(keywordsDiv);
			 for (let i = 0; i < typeToEntities.length; i++)
			 {
			   var listContainer = '<label for="text">' + '<b>' + '<u>' +
                    typeToEntities[i][0].type + '</u>' + '</b>' + '</label>'
               $("#listKeywords").append(listContainer);
			 
			   for (let j = 0; j < typeToEntities[i].length; j++)
			   {
			     addKeyword(typeToEntities[i][j].name);
			   }
			 }
            
            if($("#newText").length) {
            $("#newText").text(txtQuery);
        } // if new element already exists

        else {
            // creates static container for sentence
            var container = '<div class="column is-two-thirds" id="new">' +
                                '<h1 class="didact has-text-left title has-text-weight-light" id="newText">' +
                                    txtQuery +
                                '</h1>' + '<button id="emo" class="didact button button-padd is-pulled-right">Emotional Value</button>' + '<button id="keyw" class="didact button-padd button is-pulled-right">Keywords</button>'
                            '</div>';  
            
            // create for each lists here later
            $("#answer").append(container); // inserts container

            var emoButton = document.querySelector('#emo');
            var keywordButton = document.querySelector('#keyw');
            
            emoButton.addEventListener('click', function(event) {
              //console.log("emoButton has been clicked");
			  gapi.load('client', startSentiment);
            }, false);
            
            keywordButton.addEventListener('click', function(event) {
              var sentences = document.querySelector('#newText');
              sentences.innerHTML = txtQuery;
            
              highlightKeywords();
            }, false);
        } // create new element
            
            // highlight portion of the text
            highlightKeywords();
			
          }, function(reason) {
            console.log('Error: ' + reason.result.error.message);
          });
      };
        gapi.load('client', startEntity);


        function startSentiment() {
          gapi.client.init({
            'apiKey': 'AIzaSyCRVQxM14uTcSrVmjXSvPW_64CUqWHrKtA',
            'discoveryDocs': ['https://language.googleapis.com/$discovery/rest?version=v1']
          }).then(function() {
            return gapi.client.language.documents.analyzeSentiment({
              // not sure how to put in a JSON object in here correctly
              'document': {
                        'type': 'PLAIN_TEXT',
                        'content': txtQuery
                     }
            });
          }).then(function(response) {
            console.log(response.result);
            
            var sentencesArray = response.result.sentences;
            var newText = sentencesArray[0].text.content;
            newText = newText + " [emotional value = " + sentencesArray[0].sentiment.score + "]\n\n";
            //console.log("newText = ", newText);
            
            for (let i = 1; i < sentencesArray.length; i++)
            {
            	newText = newText + sentencesArray[i].text.content + " [emotional value = " + sentencesArray[i].sentiment.score + "]\n\n";
            }
            
            newText = newText + "[total emotional value = " + response.result.documentSentiment.score + "]\n";
            
            var sentences = document.querySelector('#newText');
            console.log("newText: ", newText);
            
            sentences.innerHTML = newText;

          });
        }
        
        //gapi.load('client', startSentiment);

    });
});