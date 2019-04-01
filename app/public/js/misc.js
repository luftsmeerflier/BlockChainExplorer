









let currentHeight = sessionStorage.getItem('blockHeight');




$(function(){
    //load cube 
    getLatestBlockHeight();
    render();

    $('.previous').on('click', function(e){
        e.preventDefault();
        let blockHeight = sessionStorage.getItem('blockHeight');
        if(blockHeight == 0){
            alert("There are no blocks prior to the Genesis Block");
            return;
        } else {
            clicked()
                .then(response => {
                    $('#cube').empty();
                    $('#cube').remove();
                })
                .then(response => {
                    prevBlock = Number(blockHeight) - 1;
                    sessionStorage.setItem('blockHeight', prevBlock);
                    //render(prevBlock);
                    location.reload();
                });
        }
    });

    $('.latest').on('click', function(e){
        e.preventDefault();
        let blockHeight;
        let settings = {
            async: true,
            crossDomain: true,
            url: "http://localhost:8080/latest-block-height",
            method: "GET"
        }; 
        $.ajax(settings).done(function(height) {
            blockHeight = height;
            let foo = sessionStorage.getItem('blockHeight');
            if(blockHeight == foo){
                alert("This is already the latest block");
            }
            sessionStorage.setItem('blockHeight', height);
        });

        clicked()
            .then(response => {
                $('#cube').empty();
                $('#cube').remove();
            })
            .then(response => {
                location.reload();
                //render(blockHeight);
            });
    });

    $('.genesis').on('click', function(e){
        e.preventDefault();
        let currentHeight = sessionStorage.getItem('blockHeight');
        if(currentHeight == 0){
            alert('Already at the genesis block');
        } else {
            sessionStorage.setItem('blockHeight', 0);
            let blockHeight = 0;
            clicked()
                .then(response => {
                    $('#cube').empty();
                    $('#cube').remove();
                })
                .then(response => {
                    location.reload();
                    //render(blockHeight);
                });
            }
    });


    $('.next').on('click', function(e){
        e.preventDefault();
        //check against latest block
        let blockHeight = sessionStorage.getItem('blockHeight');
        let settings = {
            async: true,
            crossDomain: true,
            url: "http://localhost:8080/latest-block-height",
            method: "GET"
        }; 
        $.ajax(settings).done(function(latestHeight) {
            if(latestHeight == blockHeight){
                alert("Already the latest block");
                return ;
            } else {
                // make get query to 
                let nextBlock = Number(blockHeight) + 1;
                SessionStorage.setItem('blockHeight', nextBlock);
                clicked()
                    .then(response => {
                        $('#cube').empty();
                        $('#cube').remove();
                    })
                    .then(response => {
                        //render(nextBlock);
                        location.reload();
                    });
            }
        });
    });
});

function clicked(){
    $('.wrapper > #cube').addClass('move');
    return new Promise(function(resolve, reject) {
            setTimeout(function() {
            resolve();
        }, 1000); // Wait 3s then resolve.
    });
}

function render(){
    $('button').hide();
    // Check if cube exists, append if false
    if ($('.wrapper > #cube').length < 1) {
        $('.wrapper').append(box);
    }
    let blockHeight = sessionStorage.getItem('blockHeight');
    renderBlockInfo(blockHeight);
}

function getLatestBlockHeight() {   
        let height = 15000;
            $.post(
                "http://localhost:8080/update-block-height", 
                { height : height },
                function(data, status) {
                    console.log(data);
                });
}

function renderBlockInfo(height){
    let settings = {
        async: true,
        crossDomain: true,
        url: `http://localhost:8080/block-info/${height}`,
        method: "GET"
    }; 
    $.ajax(settings).done(function(res) {
    $('.lds-circle').hide();
    //Show button
    $('button').show();
    // Append block header info
    $('.five').append(`
        <ul class="block-header-content">
        <h2 class='block-header-label'>Block header:</h2>
        <li><span class="label">version:</span> ${res.header.version}</li>
        <li class="line-break"><span class="label">previous hash: </span>${res.header.previous_hash}</li>
        <li class="line-break"><span class="label">merkle root: </span>${res.header.merkle_root}</li>
        <li><span class="label">time: </span>${res.header.time}</li>
        <li><span class="label">bits: </span>${res.header.bits}</li>
        <li><span class="label">nonce: </li>${res.header.nonce}</li>
        </ul>
    `);
    // append links to get next, prev blocks
    $('.three').append(`
        <ul class="block-header-content">
        <h2 class='block-header-label'>Miscellaneous:</h2>
            <li class="line-break"><span class="label">Block height:</span> ${res.extra.height}</li>
            <li class="line-break"><span class="label">Current block:</span> ${res.extra.hash}</li>
            <li class="line-break"><span class="label">Next block:</span> ${res.extra.next_block}</li>
            <li class="line-break"><span class="label">Previous block:</span> ${res.extra.prev_block}</a></li>
        </ul>
    `);
  })
}

function getCurrentDifficulty(){
  let settings = {
    async: true,
    crossDomain: true,
    url: "http://localhost:8080/get-current-difficulty",
    method: "GET"
  }; 
  $.ajax(settings).done(function(height) {
    for(let i = 0; i < 5; i++){
      $(".boxes").append(
        `<div class='square' data-height=${height - i}></div>`
      );
    }
  });
}









// function genesis() {   
//     updateBlock({
//       url: '/update-height',
//       type: 'put',
//       contentType: 'application/json; charset=utf-8',
//       data: JSON.stringify({
//         height: 0
//       })
//     }).then(
//       function fulfillHandler(data) {
//         alert(data);
//       },
//       function rejectHandler(jqXHR, textStatus, errorThrown) {
//         console.error("jqXHR", jqXHR)
//         console.error("textStatus", textStatus)
//         console.error("errorThrown", errorThrown)
//       }
//     ).catch(function errorHandler(error) {
//       res.send("Couldn't update block")
//     });
// }




// clicked(box)
//     .then(response => {
//         $(box).remove();
//         let newHeight = Number(currentHeight) - 1; // this becomes the 
//         sessionStorage.setItem('blockHeight', newHeight);
//     })
//     .then(response => {
//         let currentHeight = sessionStorage.getItem('blockHeight');
//         render(currentHeight);
//     })


// function clicked(box){
//     return new Promise(function(resolve, reject) {
//         $.ajax(options).done(resolve).fail(reject);
//     });
// }



// function currentBlockHeight() {   
//     ajax({
//       url: '/current-height',
//       type: 'get'
//     }).then(
//       function fulfillHandler(data) {
//         return data;
//       },
//       function rejectHandler(jqXHR, textStatus, errorThrown) {
//         console.error("jqXHR", jqXHR)
//         console.error("textStatus", textStatus)
//         console.error("errorThrown", errorThrown)
//       }
//     ).catch(function errorHandler(error) {
//       console.error("Couldn't get current block height")
//     });
// }

// function ajax(options) {
//   return new Promise(function (resolve, reject) {
//     $.ajax(options).done(resolve).fail(reject);
//   });
// }






// function genesis() {   
//     updateBlock({
//       url: '/update-height',
//       type: 'put',
//       contentType: 'application/json; charset=utf-8',
//       data: JSON.stringify({
//         height: 0
//       })
//     }).then(
//       function fulfillHandler(data) {
//         alert(data);
//       },
//       function rejectHandler(jqXHR, textStatus, errorThrown) {
//         console.error("jqXHR", jqXHR)
//         console.error("textStatus", textStatus)
//         console.error("errorThrown", errorThrown)
//       }
//     ).catch(function errorHandler(error) {
//       res.send("Couldn't update block")
//     });

// }





// function testAjax(handleData) {
//     $.ajax({
//         url:"getvalue.php",  
//         success:function(data) {
//           handleData(data); 
//         }
//     });
// }

// testAjax(function(output){
//   // here you use the output
// });

// var output = testAjax(svar);

// function getCurrentBlock(getData) {
//     let settings = {
//         async: true,
//         crossDomain: true,
//         url: "/current-height",
//         method: "GET",
//         success: 
//     }; 
//     $.ajax(settings).done(function(result) {
//         getData(result.height);
//     });
// }



// const next = function() {

// }

// const prev = function() {

// }

// function errorCheck(height, command) {
//     let settings = {
//         async: true,
//         crossDomain: true,
//         url: "http://localhost:8080/current-height",
//         method: "GET"
//     }; 
//     $.ajax(settings).done(function(obj) {
//         let currentHeight = obj.height;
//         if(command == 'genesis'){
//             if(currentHeight == height) {
//                 alert('already at the genesis block');
//             }
//         } else if (command == 'latest') {
//             console.log('foo');
//         } else if (foo == bar){
//             console.log('foo');
//         } else if (bizz == bang){
//             console.log('foo');
//         } else {
//             console.log('foo');
//         }
//     });
// }


// function render(currentHeight){
//     // see if box exists, if not create one
//     if ($('body > .box').length < 1) {
//         $('body').append(`<div class="box" data-height=${currentHeight}>`);
//     }
    
//     let box = $('body > .box');
//     $(box).on('click', function(e){
//         e.preventDefault();
//         //move box 'up' off screen, wait, and then delete using promise
//         clicked(box)
//             .then(response => {
//                 $(box).remove();
//                 let newHeight = Number(currentHeight) - 1; // this becomes the 
//                 sessionStorage.setItem('blockHeight', newHeight);
//             })
//             .then(response => {
//                 let currentHeight = sessionStorage.getItem('blockHeight');
//                 render(currentHeight);
//             })
//      });
//     }




// function clicked(box){
//     return new Promise(function(resolve, reject) {
//       $(box).addClass('move-up');
//       setTimeout(function() {
//         resolve();
//       }, 1000); // Wait 3s then resolve.
//     });
// }


// $(function(){
//     let p = makeAsyncCall('/current-height', 'get');

//     p.done(function(result) {
//         alert('hi')
//         // result what we passed to resolve()!
//         // do something with the result
//     });

//     p.fail(function(result) {
//         // result is a string because that is what we passed to reject()!
//         var error = result;
//         console.log(error);
//     });

// });

// function successCallback(result) {
//     this.d.resolve(result);
// }

// function failCallback() {
//     this.d.reject("something went wrong ");
// }

// function makeAsyncCall(url, method) {
//     let d = $.Deferred();

//     $.ajax({
//       url: url,
//       type: method,
//       success: successCallback,
//       error: failCallback
//     })

//     return d.promise();
// }
