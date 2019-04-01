'use strict';

$(function() {
    start();
    $('.previous').on('click', function(){
        blockValidation('previous')
        .then((height) => {
            moveDown()
            .then(() => {
                $('#cube').remove();
            })
            .then(() => {
                $('#experiment').append(cube);
                $('#cube').hide();
            })
            .then(() => {
                previousBlock(height);
                $('#cube').show();
            })
        })
    });

    $('.latest').on('click', function(){
        blockValidation('latest')
        .then((height) => {
            moveUp()
            .then(() => {
                $('#cube').remove();
            })
            .then(() => {
                $('#experiment').append(cube);
                $('#cube').hide();
            })
            .then(() => {
                latestBlock(height);
                $('#cube').show();
            })
        })
    });

    $('.genesis').on('click', function(){
        blockValidation('genesis')
            .then((height) => {
                moveDown()
                .then(() => {
                    $('#cube').remove();
                })
                .then(() => {
                    $('#experiment').append(cube);
                    $('#cube').hide();
                })
                .then(() => {
                    genesisBlock(height);
                    $('#cube').show();
                })
            })
    });
    $('.next').on('click', function(){
        blockValidation('next')
            .then((height) => {
                moveUp()
                .then(() => {
                    $('#cube').remove();
                })
                .then(() => {
                    $('#experiment').append(cube);
                    $('#cube').hide();
                })
                .then(() => {
                    nextBlock(height);
                    $('#cube').show();
                })
            })
    });
});

function start(){
    deleteOnStart()
        .then(() => {
            currentHeightDB()
                .then((block) => {
                    renderBlockInfo(block.height);
            })
        })
}

function moveUp() {
    $('#cube').addClass('move-up');
    return new Promise((resolve) => {
        setTimeout(() => {
            $('#cube').remove();
            resolve();
        }, 1000);
    });
}

function moveDown() {
    $('#cube').addClass('move-down');
    return new Promise((resolve) => {
        setTimeout(() => {
            $('#cube').remove();
            resolve();
        }, 1000);
    });
}

const blockValidation = function(verb){
    return new Promise(
        (resolve, reject) => {
            currentHeightDB()
                .then(function(DbBlock) {
                    return DbBlock.height;
                })
                .then(function(currentHeightInDB) {
                    if(verb == 'next'){
                        latestBlockHeight()            
                            .then(function(latestHeight) {
                                if( latestHeight == currentHeightInDB) {
                                    alert("Already at the most recent block");
                                    return;
                                };
                                let nextBlock = currentHeightInDB + 1;
                                resolve(nextBlock); 
                        });
                    } else if (verb == 'previous') {
                        blockInfo(currentHeightInDB)
                            .then(function(block){
                                if (block.info.height == 0) {
                                    alert('There are no blocks prior to the genesis block.');
                                    return;
                                };
                                let prevHeight = currentHeightInDB - 1;
                                resolve(prevHeight);
                        });
                    } else if (verb == 'genesis') {
                        if(currentHeightInDB == 0){
                            alert('already at the genesis block');
                            return;
                        } 
                        let height = 0;
                        resolve(height);
                    } else if (verb == 'latest'){
                        latestBlockHeight()
                            .then(function(latestHeight){
                                if( latestHeight == currentHeightInDB) {
                                    alert("Already at the most recent block");
                                    return;
                                };
                            resolve(latestHeight);  
                        })
                    } else {
                        reject("error in blockValidation");
                    }                          
            })
        }
    )
}



function removeButtonClasses(){
    $(".buttons-footer button:nth-of-type(1)").removeClass("previous");
    $(".buttons-footer button:nth-of-type(2)").removeClass("latest");
    $(".buttons-footer button:nth-of-type(3)").removeClass("genesis");
    $(".buttons-footer button:nth-of-type(4)").removeClass("next");
}

function addButtonClasses(){
    $(".buttons-footer button:nth-of-type(1)").addClass("previous");
    $(".buttons-footer button:nth-of-type(2)").addClass("latest");
    $(".buttons-footer button:nth-of-type(3)").addClass("genesis");
    $(".buttons-footer button:nth-of-type(4)").addClass("next");
}

function renderBlockInfo(height) {
    //so that we can't click buttons mid-load
    removeButtonClasses();
    blockInfo(height)
        .then(function(res){
            addButtonClasses();
            $('.five').empty();
            $('.five').append(`
                <div class="blockinfo-container">
                    <ul class="blockinfo">
                        <li class="pseudo-header">Block Header:</li>
                        <li>
                            <span class="label">version:</span>
                            ${res.header.version}
                        </li>
                        <li>
                            <span class="label">previous hash:</span>
                            ${res.header.previous_hash}
                        </li>
                        <li>
                            <span class="label">merkle root:</span> 
                            ${res.header.merkle_root}
                        </li>
                       
                        <li>
                            <span class="label">time:</span>
                            ${res.header.time}
                        </li> 
                        <li>                      
                            <span class="label">bits:</span>
                            ${res.header.bits}
                        </li>
                        <li>
                            <span class="label">nonce:</span>
                            ${res.header.nonce}
                        </li>
                    </ul>
                </div>
            `);

            $('.three').empty();
            $('.three').append(`
                <div class="blockinfo-container">
                    <ul class="blockinfo">
                        <li><span class="label">Block height:</span> ${res.info.height}</li>
                        <li><span class="label">Current block:</span> ${res.info.hash}</li>
                        <li><span class="label">Next block:</span> ${res.info.next_block}</li>
                        <li><span class="label">Previous block:</span> ${res.info.prev_block}</a></li>
                    </ul>
                </div>
            `);
            //now, we can click buttons again
        })
        .catch(function(error) {
            console.error("Couldn't append blockheader info");
        });  
}

const genesisBlock = function() {   
    //Some validation, then render the genesis block after 'genesis block' button clicked
    currentHeightDB()
        .then(function(currentHeight){
            if(currentHeight == 0){
                alert('already at the genesis block');
            } 
        })
        .catch(function(error) {
            console.error("Couldn't get current height");
        });

    updateBlockHeight(0)
        .then(function(genesisBlock){
            //should expect height to equal 0 in testing
            renderBlockInfo(genesisBlock.height)
                // .then(function(data){
                //     console.log("We will attach the following to HTML: ", data)
                // });
        })
        .catch(function(error) {
            console.error("Couldn't update block height. More: ", error);
        });
}

const nextBlock = function(nextHeight) {
    updateBlockHeight(nextHeight)
        .then(function(block){
            renderBlockInfo(block.height)
        })
        .catch(function(error) {
            console.error("Couldn't update height for next block:", error);
        });
}

const previousBlock = function(prevHeight) {
    updateBlockHeight(prevHeight)
        .then(function(prevBlock){
            renderBlockInfo(prevBlock.height)
        })
        .catch(function(error) {
            console.error("Couldn't update block height for previous block: ", error);
        });
}

const latestBlock = function(latestHeight) {
    updateBlockHeight(latestHeight)
        .then(function(latestBlock){
            renderBlockInfo(latestBlock.height);
        })
        .catch(function(error) {
            console.error("Couldn't update height for the latest block:", error);
        });
}





// Use latestBlockHeight, latestBlockHeight for valdation
function currentHeightDB(currentHeight) {
    return Promise.resolve(
        $.ajax({
            async: true,
            crossDomain: true,
            url: "/current-height-db",
            method: "GET"
        })
        .done(function(data){
            return data
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('jqXHR', jqXHR);
            console.log('textStatus', textStatus);
            console.log('errorThrown', errorThrown);
        })
    );
}

function latestBlockHeight() {
  return Promise.resolve(
        $.ajax({
            async: true,
            crossDomain: true,
            url: "/latest-block-height",
            method: "GET"
        })
        .done(function(data){
            return data
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('jqXHR: ', jqXHR);
            console.log('textStatus: ', textStatus);
            console.log('errorThrown: ', errorThrown);
        })
    );
}

function updateBlockHeight(height) {
    return Promise.resolve(
        $.ajax({
            async: true,
            crossDomain: true,
            url: "/update-height",
            contentType: 'application/json; charset=utf-8',
            method: "put",
            data: JSON.stringify({
                height: height
            })
        })
        .done(function(data){
            return data
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('jqXHR', jqXHR);
            console.log('textStatus', textStatus);
            console.log('errorThrown', errorThrown);
        })
    );
}

// might eventually make one generic call, with method strings as parameters
function blockInfo(height) {
    return Promise.resolve(
        $.ajax({
            async: true,
            crossDomain: true,
            url: `/block-info/${height}`,
            method: "GET"
        })
        .done(function(data){
            //return data
            console.log(data)
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('jqXHR', jqXHR);
            console.log('textStatus', textStatus);
            console.log('errorThrown', errorThrown);
        })
    );
}

function currentHeightDB() {
    return Promise.resolve(
        $.ajax({
            async: true,
            crossDomain: true,
            url: "/current-height-db",
            method: "GET"
        })
        .done(function(data){
            return data
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('jqXHR', jqXHR);
            console.log('textStatus', textStatus);
            console.log('errorThrown', errorThrown);
        })
    );
}

function deleteOnStart() {
    return Promise.resolve(
        latestBlockHeight()
            .then(function(height) {
                $.ajax({
                    async: true,
                    crossDomain: true,
                    url: "/delete-and-instantiate",
                    contentType: 'application/json; charset=utf-8',
                    method: "delete",
                    data: JSON.stringify({
                        height: height
                    })
                })
                .done(function(data){
                    return data;
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    console.error("Failed on deleteOnStart: ", jqXHR, textStatus, errorThrown)
                })
            })
            .catch(function(err){
                console.error("Failed in deleteOnStart: ", err);
            })
    )
}

const cube =          
    `<div id="cube">
        <div class="face one"></div>
        <div class="face two"><img src="../images/bitcoin.png" class="bitcoin-img"></div>
        <div class="face three"></div>
        <div class="face four"></div>
        <div class="face five"></div>
        <div class="face six"></div>
    </div>`;





















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
