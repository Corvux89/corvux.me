This tool is designed to help with planning encounters in Avrae giving an easy way to setup monsters, tokens, and maps.  

## General Setup
If you have a different Avrae prefix or want to use a different target for the `map` then you can change that in the `General Settings`. This will update the commands the tool gives.

### Getting Monsters Setup
Fill out the information on the monster you want to use 

<img src="/static/images/Avrae Combat Planner/monster.png" alt="Monster Information" width="95%"/>  
  

Go to the `Map Planner` tab, and you can set the coordinates for the monsters in using `Place Monsters` button. This will also give you the standalone `!map` command.  

<img src="/static/images/Avrae Combat Planner/coordinates.png" alt="Monster Coordinates" width="95%"/>  
  
This will also show in the map preview embedded on this tab as well. 

### Setting up the map
If you need to change the background, or map size being used you can use the `Map Settings` to set a background URL, mapsize, and change csettings if needed.  

<img src="/static/images/Avrae Combat Planner/mapsettings.png" alt="Map Settings" width="95%"/>

### Overlay
If you want to use an overlay the `Overlay Settings` can help you setup the command and preview the overlay as well. 

## Command String Options
On the `Monster Inventory` tab there are multiple toggle switches that change how the command is presented. 

`Multiline` - Includes multiline in the command for running multiple commands in Avrae  

`Include Map Target` - Includes the designated map target in the command to add to initiative (Default: "DM")  

`Include Notes` - Will convert `map` commands to all work with the native Avrae commands. This allows `multiline` to work with monster placement and map setup (**Note**: This is helpful for aliases like `bplan` or if you just want to copy and paste the entire command without splitting them up)  

`Monsters` - Includes all information pertaining to the monsters  

`Map` - Includes all information pertaining to the map  

`Overlay` - Includes all information pertaining to the overlay  


## Exporting/Importing/Saving
Because this planner relies on local storage it is recommended to export/import when you can. If reviewing someone elses plan however, we would recommend either exporting your current plan or opening in incognito mode.

Exporting will add a url to your clipboard encoding all the information for the `Monster Inventory` and `Map planner` (`General Settings` do not get exported). Then going to that link again will load up all the information stored in the url

You can additionally locally save up to 10 plans (monsters and map settings) to reload for later use