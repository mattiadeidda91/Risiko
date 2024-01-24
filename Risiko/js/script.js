/* 42 states */
document.addEventListener("DOMContentLoaded", function() 
{
    //Round and phase
    let phase = "disposition";
    let colourRound = "red";
    
    //Draw parabolic trajectory
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    let isDrawing = false;
    let startX, startY;

    //Dice
    var dice1Red = document.getElementById('dice1Red');
    var dice2Red = document.getElementById('dice2Red');
    var dice3Red = document.getElementById('dice3Red');
    var dice1Green = document.getElementById('dice1Green');
    var dice2Green = document.getElementById('dice2Green');
    var dice3Green = document.getElementById('dice3Green');

    //Battle
    let tankAttack;
    let tankDefense;
    let countryAttack;
    let countryDefense;
    let numberOfTanksAttack;
    let numberOfTanksDefense;
    let borderStatesAttack;
    let borderStatesDefense;
    let battleWinner;

    //All tanks
    const tanks = document.querySelectorAll(".tank");
    
    //Division states
    const half = Math.ceil(tanks.length / 2);
    
    // Random suddivision states
    const randomIndices = Array.from({ length: tanks.length }, (_, i) => i);
    for (let i = randomIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomIndices[i], randomIndices[j]] = [randomIndices[j], randomIndices[i]];
    }
    
    //Assign tanks to states
    for (let i = 0; i < tanks.length; i++) 
    {
        if (i < half) {
            tanks[randomIndices[i]].classList.add("tank-red");
        } else {
            tanks[randomIndices[i]].classList.add("tank-green");
        }
    }

    checkContinentOwnership();
    managePhases();

    //Mouse Right click reset line attack
    canvas.addEventListener("contextmenu", function(event) 
    {
        //Cannot open browser menu
        //event.preventDefault();
        resetCanvasLine();
       
    });

    function toggeModal()
    {
        $('#battleModal').modal("toggle");

        //Dice visibility for battle
        if(colourRound == "red")
        {
            if(numberOfTanksAttack >= 2)
                dice2Red.classList.remove("hidden");
            if(numberOfTanksAttack > 3)
                dice3Red.classList.remove("hidden");

            if(numberOfTanksDefense >= 2)
                dice2Green.classList.remove("hidden");
            if(numberOfTanksDefense > 2)
                dice3Green.classList.remove("hidden");
        }

        if(colourRound == "green")
        {
            if(numberOfTanksAttack >= 2)
                dice2Green.classList.remove("hidden");
            if(numberOfTanksAttack > 3)
                dice3Green.classList.remove("hidden");

            if(numberOfTanksDefense >= 2)
                dice2Red.classList.remove("hidden");
            if(numberOfTanksDefense > 2)
                dice3Red.classList.remove("hidden");
        }
    }

    //Add click event listener to the phase buttons
    document.getElementById("btnEndPhaseGreen").addEventListener("click", endPhaseHandler);
    document.getElementById("btnEndPhaseRed").addEventListener("click", endPhaseHandler);

    //Hide ROUND text for canvas animation
    document.querySelector(".round").addEventListener("animationend", function() {
        document.querySelector(".round").style.display = "none";
    });

    function resetCanvasLine(){
        canvas.width=0;
        canvas.height=0;
        isDrawing=false;
        resizeCanvas();
    }

    function managePhases()
    {
        //PROVARE AD AGGIUNGERE GLI EVENTI SOLO PER I CARRARMATI DEL COLORE DEL TURNO

        if(phase === "disposition")
        {
            //reset canvas
            canvas.width=0;
            canvas.height=0;
            canvas.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("resize", resizeCanvas);

            tanks.forEach(function(tank) 
            {
                tank.removeEventListener("mousedown", mouseDownHadler);
                tank.addEventListener("click", addTanksClickHandler);
            });
        }
        else if(phase === "battle")
        {
            resizeCanvas();

            window.addEventListener("resize", resizeCanvas);

            tanks.forEach(function(tank) 
            {
                tank.removeEventListener("click", addTanksClickHandler);
                tank.addEventListener("mousedown", mouseDownHadler);
            });

            canvas.addEventListener("mousemove", mouseMoveHandler);
        }
    }

    var mouseMoveHandler = function(e) {
        if (isDrawing) {
            const currentX = e.clientX - canvas.getBoundingClientRect().left;
            const currentY = e.clientY - canvas.getBoundingClientRect().top;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawParabolicLine(startX, startY, currentX, currentY);
        }
    };

    function addTanksClickHandler(e)
    {
        if(colourRound == "red" && Array.from(e.currentTarget.classList).some(c => c.includes("tank-green")) || 
            colourRound == "green" && Array.from(e.currentTarget.classList).some(c => c.includes("tank-red")))
        {
            alert("Non puoi aggiungere carrarmati all'avversario!");
            return;
        }
        
        const newTanksElement = colourRound == "red" ? document.getElementById("newTanksRed") : document.getElementById("newTanksGreen");
        const shadowOfTank = e.currentTarget.children[0];
        let tanksNumber = parseInt(e.currentTarget.children[0].innerText);
        let tanksToAdd = parseInt(newTanksElement.innerHTML);

        if(tanksToAdd > 0){
            shadowOfTank.innerHTML = ++tanksNumber;
            newTanksElement.innerHTML = --tanksToAdd;
        }
        else{
            alert("Hai terminato i carrarmati a disposizione. Inizia la Battaglia!");
        }
    }

    var mouseDownHadler = function(e)
    {      
        startX = e.clientX - canvas.getBoundingClientRect().left;
        startY = e.clientY - canvas.getBoundingClientRect().top;
        isDrawing = !isDrawing;

        //Get tanks for battle
        const elementsAtPoint = document.elementsFromPoint(startX, startY);

        if(isDrawing)
        {
            //ATTACK
            tankAttack = elementsAtPoint[0].parentElement;

            if(colourRound == "red" && Array.from(tankAttack.classList).some(c => c.includes('tank-green')) || 
                colourRound == "green" && Array.from(tankAttack.classList).some(c => c.includes('tank-red')))
            {
                alert("Non è il tuo turno!");
                resetCanvasLine();
                return;
            }
     
            countryAttack = tankAttack.getAttribute("country");
            borderStatesAttack = tankAttack.getAttribute("borderstates");
            numberOfTanksAttack = tankAttack.firstElementChild.innerHTML;
        }
        else
        {
            //DEFENSE
            tankDefense = elementsAtPoint[0].parentElement;
            countryDefense = tankDefense.getAttribute("country");
            borderStatesDefense = tankDefense.getAttribute("borderstates");
            numberOfTanksDefense = tankDefense.firstElementChild.innerHTML;

            checkBattle(); 
        }
    }

    function endPhaseHandler(e)
    {
        var btn = document.getElementById(e.target.id);

        if(phase === "disposition")
        {
            phase = "battle";
            restartAnimationRound("BATTLE");
            btn.innerHTML = "End Battle";
        }
        else if(phase === "battle")
        {
            phase = "disposition";
            btn.classList.add('hidden');
            btn.innerHTML = "Battle";
            restartAnimationRound("END ROUND");

            changeRound();
        }

        managePhases();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function restartAnimationRound(text)
    {
        var roundElement = document.querySelector(".round");

        document.getElementById('roundTxt').innerText = text;
        
        roundElement.style.animation = 'none';
        void roundElement.offsetWidth;
        roundElement.style.display = "block";
        roundElement.style.animation = 'puff-out-center 3s cubic-bezier(0.165, 0.840, 0.440, 1.000) both';
    }

    function drawParabolicLine(x1, y1, x2, y2) {
        const cx = (x1 + x2) / 2;
        const cy = Math.min(y1, y2) - 50;

        ctx.beginPath();
        ctx.setLineDash([5, 5]); 
        ctx.strokeStyle = colourRound === "red" ? "red" : "green"; 
        ctx.lineWidth = 3;
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cx, cy, x2, y2);
        ctx.stroke();
    }

    function checkBattle()
    {
        //Check and start battle
        var canBattleFaction = (Array.from(tankAttack.classList).some(c => c.includes("tank-red")) && Array.from(tankDefense.classList).some(c => c.includes("tank-green"))) 
            || (Array.from(tankAttack.classList).some(c => c.includes("tank-green")) && Array.from(tankDefense.classList).some(c => c.includes("tank-red")));

        var borderStates = borderStatesAttack.indexOf(countryDefense) >= 0;

        if(borderStates)
        {
            if(numberOfTanksAttack > 1)
            {
                if(canBattleFaction)
                {
                    toggeModal();
                }
                else{
                    alert("Non si può combattare con la stessa fazione!");
                    resetCanvasLine();
                }
            }
            else{
                alert("Non hai abbastanza carrarmati per combattere!");
                resetCanvasLine();
            }
        }
        else
        {
            alert("E' possibile attaccare solo stati confinanti!");
            resetCanvasLine();
        }
    }

    function battle(battleWinner)
    {
        var explosion = null;

        if(colourRound == "red")
        {
            if(battleWinner == "redWinner")
                explosion = tankDefense.children[1];
            else
                explosion = tankAttack.children[1];
        }   
        else
        {
            if(battleWinner == "greenWinner")
                explosion = tankDefense.children[1];
            else
                explosion = tankAttack.children[1];
        }
                    
        resetCanvasLine();
            
        explosion.classList.add('puff-out-explosion');
        explosion.addEventListener('animationend', resultOfBattle(colourRound, battleWinner, tankDefense, explosion));
    }

    function resultOfBattle(colourRound, battleWinner, tankDefense, explosion)
    {
        //Chack winner and moved tanks
        if(colourRound == "red")
        {
            if(battleWinner == "redWinner")
            {
                tankDefense.classList.remove("tank-green");
                tankDefense.classList.add("tank-red");
            }
        }
        else
        {
            if(battleWinner == "greenWinner")
            {
                tankDefense.classList.remove("tank-red");
                tankDefense.classList.add("tank-green");
            }
        }

        calculateTanksAfterBattle();

        //Remove animation class after tiny delay
        setTimeout(function() {
            explosion.classList.remove('puff-out-explosion');
        }, 100);
    }

    function winnerBattle(redDicesSum, greenDicesSum)
    {
        if(colourRound == "red")
        {
            if(redDicesSum > greenDicesSum)
                return "redWinner";
            else
                return "greenWinner";
        }
        else{
            if(greenDicesSum > redDicesSum)
                return "greenWinner";
            else
                return "redWinner";
        }
    }

    function calculateTanksAfterBattle()
    {
        if(colourRound == "red")
        {
            if(battleWinner == "redWinner")
            {
                //ATTACK WIN
                tankDefense.firstElementChild.innerHTML = numberOfTanksAttack -1;
                tankAttack.firstElementChild.innerHTML = 1;
            }
            else
            {
                //ATTACK LOSE
                let remainTanks = numberOfTanksAttack - numberOfTanksDefense;
                tankAttack.firstElementChild.innerHTML = remainTanks == 0 ? 1 : remainTanks;
            }
        }
        else
        {
            if(battleWinner == "greenWinner")
            {
                //ATTACK WIN
                tankDefense.firstElementChild.innerHTML = numberOfTanksAttack -1;
                tankAttack.firstElementChild.innerHTML = 1;
            }
            else
            {
                //ATTACK LOSE
                let remainTanks = numberOfTanksAttack - numberOfTanksDefense;
                tankAttack.firstElementChild.innerHTML = remainTanks == 0 ? 1 : remainTanks;
            }
        }
    }

    function checkContinentOwnership()
    {
        const tanksRed = document.querySelectorAll(".tank-red");
        const tanksGreen = document.querySelectorAll(".tank-green");
        let newtanksRed = parseInt(document.getElementById("newTanksRed").innerHTML);
        let newtanksGreen = parseInt(document.getElementById("newTanksGreen").innerHTML);
        let newTanksNumber = 0;

        let listOfStatesRed = [];
        let listOfStatesGreen = [];

        Array.from(tanksRed).forEach(function(t){
            const state = t.getAttribute("country");
            listOfStatesRed.push(state);
        });

        newTanksNumber = getTanksByContinent(listOfStatesRed);
        newtanksRed = (listOfStatesRed.length / 3) + newTanksNumber;
        document.getElementById("newTanksRed").innerHTML = Math.round(newtanksRed);

        if(newTanksNumber > 0){
            document.getElementById("newTanksRedIcon").innerHTML = "+" + newTanksNumber;
            document.getElementById("newTanksRedIcon").classList.remove("hidden");
        }

        Array.from(tanksGreen).forEach(function(t){
            const state = t.getAttribute("country");
            listOfStatesGreen.push(state);
        });

        newTanksNumber = getTanksByContinent(listOfStatesGreen);
        //newtanksGreen += newTanksNumber;
        newtanksGreen = (listOfStatesGreen.length / 3) + newTanksNumber;
        document.getElementById("newTanksGreen").innerHTML = Math.round(newtanksGreen);

        if(newTanksNumber > 0){
            document.getElementById("newTanksGreenIcon").innerHTML = "+" + newTanksNumber;
            document.getElementById("newTanksGreenIcon").classList.remove("hidden");
        
        }else{
            document.getElementById("newTanksGreenIcon").classList.add("hidden");
        }
    }

    function changeRound()
    {
        if(colourRound == "red")
        {
            document.getElementsByClassName("red")[0].classList.remove("pulsate-fwd");
            document.getElementById("btnEndPhaseGreen").classList.remove("hidden");
            document.getElementsByClassName("green")[0].classList.add("pulsate-fwd");
            colourRound = "green";
        }
        else
        {
            document.getElementsByClassName("green")[0].classList.remove("pulsate-fwd");
            document.getElementById("btnEndPhaseRed").classList.remove("hidden");
            document.getElementsByClassName("red")[0].classList.add("pulsate-fwd");
            colourRound = "red";
            checkContinentOwnership();
        }
    }

    function getTanksByContinent(listofStateToCheck)
    {
        newTanksBonus = 0;

        const oceaniaStates = ["indonesia", "newGuinea", "eastAsustralia", "westernAustralia"];
        const americaStates = ["alaska", "northwestTerritories", "westUnitedStates", "centralAmerica", "easternUnitedStates", "greenland", "quebec", "ontario", "alberta"];
        const southAmericaStates = ["venezuela", "brazil", "peru", "argentina"];
        const europeStates = ["iceland", "scandinavia", "greatBritain", "northEurope", "westEurope", "southEurope", "ukraine"];
        const africaStates = ["northAfrica", "egypt", "congo", "eastAfrica", "southerAfrica", "madagascar"];
        const asiaStates = ["urals", "siberia", "yakutia", "chita", "kamchatka", "japan", "mongolia", "afghanistan", "middleEast", "india", "china", "siam"];

        const oceaniaOwns = oceaniaStates.every(state => listofStateToCheck.includes(state));
        const americaOwns = americaStates.every(state => listofStateToCheck.includes(state));
        const southAmericaOwns = southAmericaStates.every(state => listofStateToCheck.includes(state));
        const europeOwns = europeStates.every(state => listofStateToCheck.includes(state));
        const africaOwns = africaStates.every(state => listofStateToCheck.includes(state));
        const asiaOwns = asiaStates.every(state => listofStateToCheck.includes(state));

        if(oceaniaOwns)
            newTanksBonus += 2;
        if(americaOwns)
            newTanksBonus += 5;
        if(southAmericaOwns)
            newTanksBonus += 2;
        if(europeOwns)
            newTanksBonus += 5;
        if(africaOwns)
            newTanksBonus += 3;
        if(asiaOwns)
            newTanksBonus += 7;

        return newTanksBonus;
    }

    function randomDiceNumber(){
        return Math.floor((Math.random() * 6) + 1);
    }

    function rollDice() 
    {
        var diceOneRedNumber = 0;
        var diceTwoRedNumber = 0;
        var diceThreeRedNumber = 0;
        var diceOneGreenNumber = 0;
        var diceTwoGreenNumber = 0;
        var diceThreeGreenNumber = 0;

        //ROUND RED ATTACK
        if(colourRound == "red")
        {
            diceOneRedNumber = randomDiceNumber();
            if(numberOfTanksAttack >= 2)
                diceTwoRedNumber = randomDiceNumber();
            if(numberOfTanksAttack > 3)
                diceThreeRedNumber = randomDiceNumber();
    
            //ROUND GREEN DEFENSE
            diceOneGreenNumber = randomDiceNumber();
            if(numberOfTanksDefense >= 2)
                diceTwoGreenNumber = randomDiceNumber();
            if(numberOfTanksDefense > 2)
                diceThreeGreenNumber = randomDiceNumber();
        }
        else if(colourRound == "green")
        {
            //ROUND RED DEFENSE
            diceOneRedNumber = randomDiceNumber();
            if(numberOfTanksDefense >= 2)
                diceTwoRedNumber = randomDiceNumber();
            if(numberOfTanksDefense > 2)
                diceThreeRedNumber = randomDiceNumber();

            //ROUND GREEN ATTACK
            diceOneGreenNumber = randomDiceNumber();
            if(numberOfTanksAttack >= 2)
                diceTwoGreenNumber = randomDiceNumber();
            if(numberOfTanksAttack > 3)
                diceThreeGreenNumber = randomDiceNumber();
        }

        if(!dice1Red.classList.contains('hidden'))
            animationLoop(dice1Red, diceOneRedNumber);
        if(!dice2Red.classList.contains('hidden'))
            animationLoop(dice2Red, diceTwoRedNumber);
        if(!dice3Red.classList.contains('hidden'))
            animationLoop(dice3Red, diceThreeRedNumber);

        if(!dice1Green.classList.contains('hidden'))
            animationLoop(dice1Green, diceOneGreenNumber);
        if(!dice2Green.classList.contains('hidden'))
            animationLoop(dice2Green, diceTwoGreenNumber);
        if(!dice3Green.classList.contains('hidden'))
            animationLoop(dice3Green, diceThreeGreenNumber);

        redDicesSum = diceOneRedNumber + diceTwoRedNumber + diceThreeRedNumber;
        greenDicesSum = diceOneGreenNumber + diceTwoGreenNumber + diceThreeGreenNumber;

        document.getElementById("resultDiceRed").innerText = redDicesSum;
        document.getElementById("resultDiceGreen").innerText = greenDicesSum;

        return winnerBattle(redDicesSum, greenDicesSum);
    }

    function animationLoop(dice, diceNumber)
    {
        for (var i = 1; i <= 6; i++) 
        {
            dice.classList.remove('show-' + i);

            if (diceNumber === i) {
                dice.classList.add('show-' + i);
            }
        }
    }

    function resetDiceVisibility()
    {
        dice2Red.classList.add("hidden");
        dice3Red.classList.add("hidden");
        dice2Green.classList.add("hidden");
        dice3Green.classList.add("hidden");
    }

    function checkWinner(){
        const tanksRed = document.querySelectorAll(".tank-red");
        const tanksGreen = document.querySelectorAll(".tank-green");
        
        if(tanksRed.length === 0)
            alert("HANNO VINTO I VERDI");
        if(tanksGreen.length === 0)
            alert("HANNO VINTO I ROSSI");
    }

    //Modal Open Animation end
    $('#battleModal').on('shown.bs.modal', function (e) {
        battleWinner = rollDice();

        setTimeout(function() {
            $('#battleModal').modal('hide');
        }, 2000);
    });

    //Modal Hide Animation end
    $('#battleModal').on('hidden.bs.modal', function (e) {
        battle(battleWinner);
        resetDiceVisibility();
        checkWinner();
    });
});

