'use strict';

$(function() {
    start();
    $('.next').on('click', function(){
        latestBlockHeight()
            .then((latestChainHeight)=>{
                nextBlock(latestChainHeight);
                $('.height').empty();
                $('.height').text(latestChainHeight);
            })

    });
    $('.previous').on('click', function(){
        previousBlock();
        latestBlockHeight()
        .then((height) => {
            $('.height').empty();
            $('.height').text(height);
        });
    });
});

function previousBlock() {
    currentHeightDB()
    .then((block) => {
        let currentHeight = block.height;
        if (currentHeight == 0) {
            alert("There are no blocks prior to the genesis block!");
        } else {
            moveDown()
            .then(()=>{
                let prevHeight = currentHeight - 1;
                renderBlockInfo(prevHeight);     
                updateDbHeight(prevHeight);
            })
        }
    })
    .catch(function(error) {
        console.error("Couldn't update height for next block:", error);
    });
}

function nextBlock(currentChainHeight) {
    currentHeightDB()
    .then((block) => {
        let height = block.height;
        if(height == currentChainHeight){
            alert("Already on the most recent block!");
        } else {
            moveUp()
            .then(()=>{
                let nextHeight = height + 1;
                renderBlockInfo(nextHeight);
                updateDbHeight(nextHeight);
            })
        }
    })
    .catch(function(error) {
        console.error("Couldn't update height for next block:", error);
    });
}

// Otherwise, I plan to travel and gig using workaway.info

// What web framework do you use? 

// -Mapi

function start(){
    if( !($('.cube').length )){
        $('.wrap').append(cube);
    }
    latestBlockHeight()
        .then((latestHeight) => {
            return latestHeight
        })
        .then((height)=>{
            deleteOnStart(height)
                .then((block) => {
                    //current height in DB
                    let height = block.height;
                    $('.height').text(height);
                    $('.db-height').text(height);
                });
        });
}

$('#find-block').on('submit', function(e) { //use on if jQuery 1.7+
    e.preventDefault();  //prevent form from submitting
    $('.instructions').remove();
    currentHeightDB()
       .then((dbBlock) => {
                let currentHeightDB = dbBlock.height;
            latestBlockHeight()
            .then((latestChainHeight) => {
                let data = $("#find-block :input").serializeArray();
                let value = data[0].value; //use the console for debugging, F12 in Chrome, not alerts
                if(isNaN(value)){
                    alert("please enter a valid number");
                } else if(value > latestChainHeight){
                    alert("That block hasn't been discovered!");
                } else if (value < 0) {
                    alert("There are no blocks prior to the genesis block!");
                } else {
                    if(value > currentHeightDB){
                        moveUp()
                        .then(() => {
                            render(value);
                        });
                    } else {
                        moveDown()
                        .then(() => {
                            render(value);
                        });
                    }
                }
            })
        })
        .catch(function(error) {
            console.error("Couldn't append blockheader info");
        });
        function render(value){
            renderBlockInfo(value);
            updateDbHeight(value);
        }
});

function updateOnChainElem(height){
    $('.current-height').data('data-height-on-chain', height);
}

function updateDbElem(height){
    $('.current-block-db').data('data-height-in-db', height);
}

function getHeightDB(){
    return $('.current-block-db').data('height-in-db');
}

function getHeightOnChain(){
    return $('.current-height').data('height-on-chain');
}


const cube = `        
    <div class="cube">
        <div class="front">
            <img class="bitcoin-small" alt="bitcoin logo" src="../images/bitcoin.png">
        </div>
        <div class="back"></div>
        <div class="top"></div>
        <div class="bottom"></div>
        <div class="left"></div>
        <div class="right"></div>
    </div>`;

function moveUp() {
    $('.cube > *').addClass('move-up');

    return new Promise(function(resolve) {
        setTimeout(resolve, 1000);
    });
}


function moveDown() {
    $('.cube > *').addClass('move-down');
    return new Promise(function(resolve) {
        setTimeout(resolve, 1000);
    });
}

$('.reset').on('click', function(){
    $('.blockinfo-container').remove();
    $('.reset').css('display', 'none');
    $('.form').css('display', 'block');
    $('.previous').css('display', 'block');
    $('.next').css('display', 'block');
    $('.cube-content').append(cube);
});

function currentHeightDB() {
    return new Promise((resolve, reject) => {
        $.ajax({
            async: true,
            crossDomain: true,
            url: "/current-height-db",
            method: "GET"
        })
        .done(function(data){
            resolve(data.height);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('jqXHR', jqXHR);
            console.log('textStatus', textStatus);
            console.log('errorThrown', errorThrown);
        })
    });
}

function renderBlockInfo(height) {
    $('.cube').remove();
    //so that we can't click buttons mid-load
    currentDifficulty()
    .then((difficulty) => {
        blockInfo(height, difficulty)
        .then(function(res){
                $('.blockinfo-container').remove();
                $('.reset').css('display', 'block');
                $('.form').css('display', 'none');
                $('.previous').css('display', 'none');
                $('.next').css('display', 'none');

                $('.db-height').empty();
                $('.db-height').text(height);


 
                $('.wrap').append(`
                    <div class="blockinfo-container">
                    <ul class="blockinfo">
                        <h3 class="pseudo-header">Block Header:</h3>
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
            })
        })
        .catch(function(error) {
            console.error("Couldn't append blockheader info");
        });  
    
}

function updateDbHeight(height) {
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
            console.error('jqXHR', jqXHR);
            console.error('textStatus', textStatus);
            console.error('errorThrown', errorThrown);
        })
    );
}


function currentHeightDB() {
    return new Promise((resolve, reject) => {
        $.ajax({
            async: true,
            crossDomain: true,
            url: "/current-height-db",
            method: "GET"
        })
        .done(function(data){
            resolve(data);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log('jqXHR', jqXHR);
            console.log('textStatus', textStatus);
            console.log('errorThrown', errorThrown);
        })
    });
}

// might eventually make one generic call, with method strings as parameters

function blockInfo(height, difficulty) {
    return Promise.resolve(
        $.ajax({
            async: true,
            crossDomain: true,
            url: `/block-info/${height}`,
            method: "GET",
            data : {
                difficulty : JSON.stringify(difficulty)
            }
        })
        .done(function(data){
            return data
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('jqXHR', jqXHR);
            console.error('textStatus', textStatus);
            console.error('errorThrown', errorThrown);
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
            console.error('jqXHR: ', jqXHR);
            console.error('textStatus: ', textStatus);
            console.error('errorThrown: ', errorThrown);
        })
    );
}

function deleteOnStart(heightOnChain) {
    return new Promise((resolve, reject) => {
        $.ajax({
            async: true,
            crossDomain: true,
            url: "/delete-and-instantiate",
            contentType: 'application/json; charset=utf-8',
            method: "delete",
            data: JSON.stringify({
                height: heightOnChain
            })
        })
        .done(function(data){
            resolve(data);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Failed on deleteOnStart: ", jqXHR, textStatus, errorThrown)
        })
    });
}

function currentDifficulty() {
    return Promise.resolve(
        $.ajax({
            async: true,
            crossDomain: true,
            url: `/get-current-difficulty`,
            method: "GET"
        })
        .done(function(data){
            return data
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('jqXHR', jqXHR);
            console.error('textStatus', textStatus);
            console.error('errorThrown', errorThrown);
        })
    )
}













function blockValidation(verb){
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
                                } else {
                                    let nextBlock = currentHeightInDB + 1;
                                    resolve(nextBlock); 
                                }
                        });
                    } else if (verb == 'previous') {
                            blockInfo(currentHeightInDB, difficulty)
                            .then(function(block){
                                if (block.info.height < 0) {
                                    alert('There are no blocks prior to the genesis block.');
                                    return;
                                } else {
                                    let prevHeight = currentHeightInDB - 1;
                                    resolve(prevHeight);
                                }
                            });
                    } else {
                        reject("error in blockValidation");
                    }                          
            })
        }
    )
}