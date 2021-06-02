let averageTileSize = 63, // Taille moyenne en Ko d'une tuile
    maximumAllTilesSize = 500000; // Poids maximum en Ko que peut atteindre le stockage de l'ensemble tuiles

let links = [],
    nbFiles = 10000,
    imagesLoaded = 0,
    totalImages = 0,
    imageLoaded = false;

let loadingScreen = document.querySelector('.loading-screen'),
    alertDiv = document.querySelector('.alert'),
    downloadSection = document.querySelector('.download-section'),
    dafaultValueBtn = document.querySelector(".dafaultValueBtn"),
    selectAllTiles = document.querySelector(".selectAllTiles");

dafaultValueBtn.addEventListener('click', event => {
    defaultValue();
});

document.addEventListener('DOMContentLoaded', function() {
    if(selectAllTiles.checked) {
        selectAllTiles.checked = false; 
    }
})

document.getElementById("form").addEventListener("submit", function (e) {
    let err;

    // Récupère toutes les valeurs des champs du formulaire
    let url = document.getElementById("url").value;
    
    if(document.getElementById("url").value.includes("http")) {
        document.getElementById("url").value = url.replace('http', 'https');
    }
    
    let min_zoom = parseInt(document.getElementById("min_zoom").value),
        max_zoom = parseInt(document.getElementById("max_zoom").value),
        x_min_max_zoom = parseInt(document.getElementById("x_min_max_zoom").value),
        y_min_max_zoom = parseInt(document.getElementById("y_min_max_zoom").value),
        x_max_max_zoom = parseInt(document.getElementById("x_max_max_zoom").value),
        y_max_max_zoom = parseInt(document.getElementById("y_max_max_zoom").value);
    
    console.log(url);

    // Vérifie si l'ensemble des champs ont été renseignés
    let inputs = this.getElementsByTagName("input");
     
    for (let i=0; i<inputs.length; i++) {
        if (!inputs[i].value) {
            err = "Veuillez renseigner tous les champs.";
        }
    }

    // Traite et affiche l'erreur relatives aux valeurs des champs s'il y en a
    if (err) {
        e.preventDefault();
        document.getElementById("err").classList.add('active');
        document.getElementById("err").innerHTML = err;
    } else {
        // Retire l'erreur relatives aux valeurs des champs
        e.preventDefault();
        err = "";
        document.getElementById("err").classList.remove('active');
        document.getElementById("err").innerHTML = err;
       
        // Calcul le poids total pour le stockage de l'ensemble des tuiles selon les variables fournies par l'utilisateur
        let result = (y_max_max_zoom - y_min_max_zoom + 1) * (x_max_max_zoom - x_min_max_zoom + 1) * averageTileSize;
        console.log(result);

        // Si le poids est inférieur à la limite fixée par la variable maximumAllTilesSize alors les images sont générés
        if (result < maximumAllTilesSize && result > 0) {
            console.log('Success!')

            // Précalcule les x min, y min, x max, y max pour toute valeur de z
            let allCoordTiles = [{zoomLevel: max_zoom, xMin: x_min_max_zoom, yMin: y_min_max_zoom, xMax: x_max_max_zoom, yMax: y_max_max_zoom}];

            for(let i = 1; i < max_zoom - min_zoom + 1; i++) {
                allCoordTiles.push(
                    {
                        zoomLevel: max_zoom - i,
                        xMin: isOdd(allCoordTiles[i - 1].xMin) / 2,
                        yMin: isOdd(allCoordTiles[i - 1].yMin) / 2,
                        xMax: isOdd(allCoordTiles[i - 1].xMax) / 2,
                        yMax: isOdd(allCoordTiles[i - 1].yMax) / 2
                    }
                ); 
            }

            console.log(allCoordTiles);

            // Pour tout z allant de zoom min à zoom max :
            allCoordTiles.map(tile => {
                let zoomStep = tile.zoomLevel.toString();
                zoomStep = url.replace('{z}', zoomStep);

                // Pour tout x allant de x min de z à x max de z
                for(let j = tile.xMin; j <= tile.xMax; j++) {
                    let xStep = zoomStep.replace('{x}', `${j}`);

                    if (tile.xMin != tile.xMax) {
                        let xStep = zoomStep.replace('{x}', `${j}`);
                    } else {
                        let xStep = zoomStep.replace('{x}', `${j - 1}`);
                    }

                    // Pour tout y allant de y min de z à y max de z :
                    for(let k = tile.yMin; k <= tile.yMax; k++) {
                        let yStep = xStep.replace('{y}', `${k}`);

                        if (tile.yMin != tile.Max) {
                            let yStep = zoomStep.replace('{x}', `${j}`);
                        } else {
                            let yStep = zoomStep.replace('{x}', `${j - 1}`);
                        }
                        addElement(yStep);
                        totalImages++;
                    }

                    
                    // let resultDiv = document.getElementById('tilesResult');
                    // let lastImg = resultDiv.lastChild;
                    // console.log(lastImg);
                }
            });

            loadingScreen.classList.remove("hidden");
            loadingScreen.classList.add("reveal");
            setTimeout(() => {
                alertDiv.classList.add("alert-reveal");
            }, 500)
            
            let allTiles = document.querySelectorAll('.tile');
            let c = 1;

            allTiles.forEach(element => {
                // console.log(element.firstChild);
                element.firstChild.onload = function() {
                    // console.log(Math.round(((c/allTiles.length)*100)*10)/10);
                    document.querySelector(".tiles-dl").style.width = Math.round(((c/allTiles.length)*100)*10)/10 + "%";

                    if (element.firstChild.complete) {
                        imagesLoaded++;
                      } else {
                        element.firstChild.addEventListener('load', () => {
                            imagesLoaded++
                        })
                        element.firstChild.addEventListener('error', function() {
                            alert('error')
                        })
                      }

                    if (imagesLoaded == totalImages - 3) {
                      allImagesLoaded()
                    }

                    c++;
                };
            })              
            
            function allImagesLoaded() {
                imageLoaded = true;
                alertDiv.classList.remove("alert-reveal");
                setTimeout(() => {
                    loadingScreen.classList.add("hidden");
                }, 500)
                setTimeout(() => {
                    downloadSection.classList.remove("hidden");
                    downloadSection.classList.add("download-reveal");
                }, 1200)
                console.log("ALL IMAGES LOADED")
            }

            selectAllTiles.addEventListener('change', event => {
                if(allTiles.length != 0) {
                    if(!selectAllTiles.checked) {
                        links = [];
                        allTiles.forEach(element => {
                            element.classList.remove('selected');
                        });
                    } else {
                        links = [];
                        allTiles.forEach(element => {
                            element.classList.remove('selected');
                            if(!element.classList.contains("selected")) {
                                element.classList.add('selected')
                                links.push(element.firstChild.getAttribute('src'));
                            } else if(element.classList.contains("selected")) {
                                element.classList.remove('selected');
                                let itemtoRemove = element.firstChild.getAttribute('src');
                                // links.splice($.inArray(itemtoRemove, links), 1);
                                links.splice(links.indexOf(itemtoRemove), 1);
                            }
                        });
                        console.log(links);
                    }
                } else {
                    console.log("no");
                }
            });

            allTiles.forEach(element => {
                element.addEventListener('click', function(event) {
                    if(!element.classList.contains("selected")) {
                        element.classList.add('selected')
                        links.push(element.firstChild.getAttribute('src'));
                    } else {
                        element.classList.remove('selected');
                        let itemtoRemove = element.firstChild.getAttribute('src');
                        // links.splice($.inArray(itemtoRemove, links), 1);
                        links.splice(links.indexOf(itemtoRemove), 1);
                    }
                    if(selectAllTiles.checked) {
                        selectAllTiles.checked = false; 
                    }
                    console.log(links);
                })
            });
            
        // Traite et affiche l'erreur si le poids est supérieur à la limite fixée par la variable maximumAllTilesSize
        } else {
            err = "Stoackage trop important. Veuillez revoir les dimensions de la carte à la baisse."
            document.getElementById("err").classList.add('active');
            document.getElementById("err").innerHTML = err;
        }
    }
})


function isOdd(num) { 
    if (num % 2) {
        return num - 1;
    } else {
        return num;
    }
}

function addElement (urlTile) {
    let newImg = document.createElement("div");
    newImg.classList.add('tile');
    let newContent = '<img class="image" src="'+ urlTile +'" alt="">';
    newImg.innerHTML = newContent;
  
    let currentDiv = document.getElementById('tilesResult');
    currentDiv.append(newImg);
  }

function defaultValue() {
    // url.value = "http://igm.univ-mlv.fr/~gambette/gallicarte/getTile.php?z={z}&x={x}&y={y}&source=stamen&id=terrain";
    // url.value = "http://igm.univ-mlv.fr/~gambette/gallicarte/getTile.php?z={z}&x={x}&y={y}&source=mapwarper&id=26642";
    url.value = "http://igm.univ-mlv.fr/~gambette/gallicarte/getTile.php?z={z}&x={x}&y={y}";
    // url.value = "https://mapwarper.net/maps/tile/26642/{z}/{x}/{y}.png";
    min_zoom.value = 10;
    max_zoom.value = 18;
    x_min_max_zoom.value = 132761;
    y_min_max_zoom.value = 90166;
    x_max_max_zoom.value = 132787;
    y_max_max_zoom.value = 90196;
    // x_min_max_zoom.value = 132785;
    // y_min_max_zoom.value = 90194;
    // x_max_max_zoom.value = 132787;
    // y_max_max_zoom.value = 90196;
}

function generateZIP() { 
    console.log(links.length)  
    if(links.length == 0) {
        console.log('La taille du tableau est : ' + links.length);
        console.log('Aucuns fichiers à télécharger!');
    } else if (links.length > nbFiles) { // Valeur de test, à modifier lors du déploiement 
        console.log('La taille du tableau est : ' + links.length);
        console.log('Fichier(s) trop lourd(s)');

        let newArray =[];
        for (k=0; k<links.length; k+=15000) { // Valeur de test, à modifier lors du déploiement 
            newArray.push(links.slice(k,k+15000)); // Valeur de test, à modifier lors du déploiement 
        }  
        console.log(newArray);

        // newArray.map(file => {
        //     setZIP(file);
        // });
    } else if (links.length < nbFiles) { // Valeur de test, à potentiellement modifier lors du déploiement 
        console.log('La taille du tableau est : ' + links.length);
        setZIP(links);
    }
};

function setZIP(array) {
    document.querySelector('.download').value = "Téléchargement en cours";
    let zip = new JSZip();
    let count = 0;
    let zipFilename = "tile-group.zip";
    
    array.forEach(function (url, i) {
        let filename = array[i];
        filename = filename.replace(/[\/\*\|\:\<\>\?\"\&\\]/gi, '').replace("httpigm.univ-mlv.fr~gambettegallicartegetTile.php","") + ".jpg";
        // loading a file and add it in a zip file
        JSZipUtils.getBinaryContent(url, function (err, data) {
            if (err) {
                throw err; // or handle the error
            }
            zip.file(filename, data, { binary: true });
            count++;
            document.querySelector(".zip-dl").style.width = Math.round(((i/array.length)*100)*10)/10 + "%";
            if (count == array.length) {
                zip.generateAsync({ type: 'blob' }).then(function (content) {
                saveAs(content, zipFilename);
                });
                document.querySelector('.download').value = "Télécharger";
            }
        });
    });
    console.log("DONE")
}