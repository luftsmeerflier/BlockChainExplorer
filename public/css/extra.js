'use strict';

function moveUp() {
    $('#cube').addClass('move-up');
    return new Promise((resolve) => {
        setTimeout(() => {
            $('#cube').remove();
            resolve();
        }, 1000);
    });
}

$(function(){
    deleteOnStart();
    $('.previous').on('click', function(){
        prevBlock();
    });

    $('.latest').on('click', function(){
        //get latest block height
        //update Block Height in db (latestHeight)
        //renderBlockInfo(latestBlock.height);
        latestBlock()
            .then(() => {
                //moves up
                //remove cube 
                moveUp()
                    .then(() => {
                        $('#experiment').append(`
                            <div id="cube">
                                <div class="face one"></div>
                                <div class="face two"><img src="../images/bitcoin.png" class="bitcoin-img"></div>
                                <div class="face three"></div>
                                <div class="face four"></div>
                                <div class="face five"></div>
                                <div class="face six"></div>
                            </div>
                        `);
                    });      
                })
    });

    $('.genesis').on('click', function(){
        blockValidation('genesis')
            .then((data) => {
                console.log(data);
            });
        //genesisBlock();
    });

    $('.next').on('click', function(currentHeightDB){
        blockValidation('next')
            .then(function(){
                moveUp()
                .then(() => {
                    $('#cube').remove();
                })
                .then(() => {
                    $('#experiment').append(`
                        <div id="cube">
                            <div class="face one"></div>
                            <div class="face two"><img src="../images/bitcoin.png" class="bitcoin-img"></div>
                            <div class="face three"></div>
                            <div class="face four"></div>
                            <div class="face five"></div>
                            <div class="face six"></div>
                        </div>
                    `);
                })
                .then(() => {
                    nextBlock(currentHeightDB);
                })     
            });
    });
});

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
                        <li class="pseud-header">Miscellaneous info:</li>
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
                                };
                                let nextBlock = currentHeightInDB + 1;
                                resolve(nextBlock); 
                        });
                    } else if (verb == 'previous') {
                        blockInfo(currentHeightInDB)
                            .then(function(block){
                                if (block.info.height == 0) {
                                    alert('There are no blocks prior to the genesis block.');
                                }
                        });
                    } else if (verb == 'genesis') {
                        if(currentHeightInDB == 0){
                            alert('already at the genesis block');
                        } 
                    } else if (verb == 'latest'){
                        latestBlockHeight()
                            .then(function(latestHeight){
                                if( latestHeight == currentHeightInDB) {
                                    alert("Already at the most recent block");
                                };
                        })
                    } else {
                        reject("error in blockValidation");
                    }                          
            })
        }
    )
}


    // currentHeightDB()
    //     .then(function(DBblock){
    //         let currentHeight = block.height;
    //         blockInfo(currentHeight)
    //             .then(function(block){
    //                 if (block.info.height == 0) {
    //                     alert('There are no blocks prior to the genesis block.');
    //                 }
    //             });

    //     .catch(function(error) {
    //         console.error("Couldn't GET current height: ", error);
    //     });














const genesisBlock = function() {   
    //Some validation, then render the genesis block after 'genesis block' button clicked
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

const nextBlock = function(currentDbHeight) {
    // see if current height is already latest block, ipso fact there not being a 'next' 
    let newHeight = currentDbHeight + 1;
    updateBlockHeight(newHeight)
        .then(function(nextBlock){
            //render the data in the 'next' block
            renderBlockInfo(nextBlock.height)
                // .then(function(data){

                // });
        })
        .catch(function(error) {
            console.error("Couldn't update height for next block:", error);
        });
}

const prevBlock = function() {
    // see if current height is genesis  block, ipso fact there not being a 'previous' 
    let newHeight = currentHeight - 1;
    updateBlockHeight(newHeight)
        .then(function(previous){
            //render the data in the 'next' block
            renderBlockInfo(previous.height)
                // .then(function(data){
                //     console.log("We will attach the following to HTML: ", data)
                // });
        })
        .catch(function(error) {
            console.error("Couldn't update block height for previous block: ", error);
        });

}

const latestBlock = function() {
    //get current block
    //get latest block
   
    updateBlockHeight(latestHeight)
        .then(function(latestBlock){
            renderBlockInfo(latestBlock.height);
        })
        .catch(function(error) {
            console.error("Couldn't update height for the latest block:", error);
        });
        // .catch(function(error) {
        //     console.error("Couldn't GET current height: ", error);
        // });
}



// Use latestBlockHeight, latestBlockHeight for valdation
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

function latestBlockHeight() {
    return new Promise (
        (resolve, reject) => {
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
        }
    )
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
            return data
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('jqXHR', jqXHR);
            console.log('textStatus', textStatus);
            console.log('errorThrown', errorThrown);
        })
    );
}















