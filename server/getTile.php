<?php
/*

    getTile.php, v1.0, 2021-05-26
    Add a header avoiding CORS errors on map tiles
    Copyright (C) 2021 - Philippe Gambette

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

header("Access-Control-Allow-Origin: *");
header('Content-Type: image/jpeg');
if(isset($_GET["x"])){
   $x = intval($_GET["x"]);   
   $y = intval($_GET["y"]);
   $z = intval($_GET["z"]);
   $id = "terrain";
   if(isset($_GET["id"])){
      $id = $_GET["id"];
   }
   
   // By default, get stamen tiles
   $urlBegin = "https://stamen-tiles.a.ssl.fastly.net/".$id."/";
   $urlEnd = ".png";
   if(isset($_GET["source"])){
      if($_GET["source"] == "mapwarper"){
         // Get mapwarper tiles
         $urlBegin = "https://mapwarper.net/maps/tile/".$id."/";
         $urlEnd = ".png";
      }
   }
   $fullQuery = $urlBegin.$z."/".$x."/".$y.$urlEnd;
   $homepage = file_get_contents($fullQuery);
   echo $homepage;
}
?>