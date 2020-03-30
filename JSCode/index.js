const Discord = require('discord.js');
const cron = require('node-cron');
const client = new Discord.Client();
var insectesN = require('./insectesN.json');
var poissonsN = require('./poissonsN.json');
//TODO: traiter, eventuellement, plus de filtres (sans ordre)
var listeCommandes = ["!insectes nord","!poissons nord","!aide", "!details"];
const nomMois = ["Janvier", "Février" ,"Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const nomJours = ["Lundi", "Mardi" ,"Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
 });

client.on('message', msg => {
  console.log(msg.content);
  // Vérifier le premier input de la commande
  if(msg.content.split(' ')[0]==='!insectes' || msg.content.split(' ')[0]==='!poissons')
  { // Si c'est une commande concernant les insectes ou les poissons
    if(msg.content.split(' ')[1]!='nord' && msg.content.split(' ')[1]!='sud')
    { // si le premier parametre n'est pas l'hemisphere
      msg.reply("tu as oublié l'hémisphère, saisis 'sud' ou 'nord' après ta commande.");
    }
    else
    {
      if (msg.content.split(' ')[0] === '!insectes') {
        msg.reply('voici la liste des insectes disponibles actuellement : \n' + listeInsectesNow(insectesN, 0, Math.floor(insectesN.length/3)));
        msg.reply('\n' + listeInsectesNow(insectesN, Math.floor(insectesN.length/3), Math.floor(2*insectesN.length/3)));
        msg.reply('\n' + listeInsectesNow(insectesN, Math.floor(2*insectesN.length/3), insectesN.length));

      } else if (msg.content.split(' ')[0] === '!poissons') {
        msg.reply('voici la liste des poissons disponibles actuellement : \n' + listePoissonsNow(poissonsN, 0, Math.floor(poissonsN.length/3)));
        msg.reply('\n' + listeInsectesNow(poissonsN, Math.floor(poissonsN.length/3), Math.floor(2*poissonsN.length/3)));
        msg.reply('\n' + listeInsectesNow(poissonsN, Math.floor(2*poissonsN.length/3), poissonsN.length));

      }
    }
  } else if (msg.content.split(' ')[0] === '!details') {
    if (!msg.content.split(' ')[1]) {
      msg.reply('tu dois préciser un animal, par exemple !details Taupe-grillon');
    } else {
      // Garder seulement le nom de l'animal, apres l'espace
      nomAnimal = msg.content.slice(9 , msg.content.length);
      infoAnimal = findAnimal(nomAnimal);
      console.log(infoAnimal);
      if (infoAnimal != null) {
        msg.reply("voici le détail de l'animal : \n" + infoAnimal);
      } else {
        msg.reply("ton animal n'a pas été trouvé.");
      }
    }
    } else if (msg.content === '!aide') {
      msg.reply('voici la liste des commandes disponibles : \n' + commandesToString());
    }
});

// Token du bot
client.login('NjkzODI5NjE3NDIwNTk5MzM4.XoDb0A.giPfY0oShei-ws4yJS4ZuKqTito');

function listeInsectesNow(liste, start, end) {
  var animaux = "";
  for (i = start; i < end; i++) {
    if (liste[i].période === "Toute l'année" || isActualM(liste[i].période)) {
      if (liste[i].heure === "Toute la journée" || isActualH(liste[i].heure)) {
        animaux += afficheInsecte(liste[i]);
      }
    }
  }
  return animaux;
}

function listePoissonsNow(liste, start, end) {
  var animaux = "";
  for (i = start; i < end; i++) {
    if (liste[i].période === "Toute l'année" || isActualM(liste[i].période)) {
      if (liste[i].heure === "Toute la journée" || isActualH(liste[i].heure)) {
        animaux += affichePoisson(liste[i]);
      }
    }
  }
  return animaux;
}

function monthToInt(mois) {
  return nomMois.indexOf(mois);
}

function monthToString(mois) {
  return nomMois[mois];
}

function dayToString(day) {
  return nomJours[day];
}

function isActualM(periode) {
  if (periode.split(', ')[1]) {
    return isActualM(periode.split(', ')[0]) || isActualM(periode.split(', ')[1]);
  }
  var debutM = periode.split(' - ')[0];
  if (!periode.split(' - ')[1]) {
    return actuelM == debutM;
  }
  var finM = periode.split(' - ')[1];
  debutM = monthToInt(debutM);
  finM = monthToInt(finM);
  var date = new Date();
  var actuelM = date.getMonth();
  if (debutM <= finM) {
    return debutM <= actuelM && actuelM <= finM;
  } else {
    return actuelM <= finM || debutM <= actuelM;
  }
}

function isActualH(heure) {
    var debutH = heure.split(' - ')[0];
    debutH = debutH.slice(0, -1);
    var finH = heure.split(' - ')[1];
    finH = finH.slice(0, -1);
    var date = new Date();
    var actuelH = date.getHours();
    debutH = parseInt(debutH);
    finH = parseInt(finH);
    actuelH = parseInt(actuelH);
    if (debutH < finH) {
      return debutH <= actuelH && actuelH < finH;
    } else {
      if (debutH <= actuelH && actuelH <= 23) {
        return debutH <= actuelH && actuelH > finH;
      } else {
        return debutH > actuelH && actuelH < finH;
      }
    }
}

function findAnimal(nomAnimal) {
  var found = false;
  nomAnimal = nomAnimal.toUpperCase();
  for (i = 0; !found && i < insectesN.length; i++) {
    if (!found && insectesN[i].nom.toUpperCase() === nomAnimal) {
      found = true;
      return afficheInsecte(insectesN[i]);
    }
    if (!found && poissonsN[i].nom.toUpperCase() === nomAnimal) {
      found = true;
      return affichePoisson(poissonsN[i]);
    }
  }
  return null;
}

function afficheInsecte(animalJSON) {
  var animal = "";
  animal += "Nom: " + animalJSON.nom + "\n";
  animal += "Période: " + animalJSON.période + "\n";
  animal += "Heure: " + animalJSON.heure + "\n";
  animal += "Lieu: " + animalJSON.lieu + "\n";
  animal += "Prix: " + animalJSON.prix + " clochettes \n";
  animal += "\n";
  return animal;
}

function affichePoisson(animalJSON) {
  var animal = "";
  animal += "Nom: " + animalJSON.nom + "\n";
  animal += "Période: " + animalJSON.période + "\n";
  animal += "Heure: " + animalJSON.heure + "\n";
  animal += "Lieu: " + animalJSON.lieu + "\n";
  animal += "Prix: " + animalJSON.prix + " clochettes \n";
  animal += "Taille: " + animalJSON.taille + "\n";
  animal += "\n";
  return animal;
}

// lister les commandes
function commandesToString() {
  var res = "";

  for(i=0; i<listeCommandes.length; i++)
  {
    res += listeCommandes[i] + '\n';
  }

  return res;
}

//se lance à 6h du matin tous les jours
let jobBulletin = cron.schedule('50 * * * * *', function() {
  bulletinInsulaire();
});

function bulletinInsulaire() {
  console.log('oui');
  client.login('NjkzODI5NjE3NDIwNTk5MzM4.XoDb0A.giPfY0oShei-ws4yJS4ZuKqTito');
  // channel bulletin-insulaire
  client.channels.fetch('694146170527940618')
    .then(channel => channel.send(texteBulletinInsulaire()))
    .catch(console.error);
}

function texteBulletinInsulaire() {
  var txt = "";
  txt += "Bonjour à tous, nous sommes le ";
  var date = new Date();
  var j = date.getDay();
  var m = date.getMonth();
  var a = date.getFullYear();
  txt += dayToString(j) + ' ';
  txt += date.getDate() + ' ';
  txt += monthToString(m) + ' ';
  txt += a + ' et voici votre bulletin insulaire quotidien !\n';
  txt += "S'il vous manque un de ces insectes ou poissons, dépêchez-vous, c'est le dernier mois pour les attraper : \n";
  txt += "\tInsectes : \n";
  txt += "\t" + "\t" + dernierMoisInsectes();
  txt += "\tPoissons : \n";
  txt += "\t" + "\t" + dernierMoisPoissons();
  txt += "Pour ce qui est des nouveaux poissons et insectes de ce mois-ci, voici la liste : \n"
  txt += "\tInsectes : \n";
  txt += "\t" + "\t" + premierMoisInsectes();
  txt += "\tPoissons : \n";
  txt += "\t" + "\t" + premierMoisPoissons();

  console.log(txt);
  //return txt;
}

function dernierMoisInsectes() {
  var date = new Date();
  var lastInsectes = "";
  for (i = 0; i < insectesN.length; i++) {
    if (insectesN[i].période.split(', ')[1]) {
      var p1 = insectesN[i].période.split(', ')[0];
      var p2 = insectesN[i].période.split(', ')[1];
      if (p1.split(' - ')[1] === monthToString(date.getMonth())) {
        lastInsectes += insectesN[i].nom + ', ';
      }
      if (p2.split(' - ')[1]) {
        if (p1 !== p2 && p2.split(' - ')[1] === monthToString(date.getMonth())) {
          lastInsectes += insectesN[i].nom + ', ';
        }
      } else {
        if (p2 === monthToString(date.getMonth())) {
          lastInsectes += insectesN[i].nom + ', ';
        }
      }
    } else if (insectesN[i].période.split(' - ')[1] === monthToString(date.getMonth())) {
      lastInsectes += insectesN[i].nom + ', ';
    }
  }
  lastInsectes = lastInsectes.substring(0, lastInsectes.length - 2);
  return lastInsectes + '\n';
}

function dernierMoisPoissons() {
  var date = new Date();
  var lastPoissons = "";
  for (i = 0; i < poissonsN.length; i++) {
    if (poissonsN[i].période.split(', ')[1]) {
      var p1 = poissonsN[i].période.split(', ')[0];
      var p2 = poissonsN[i].période.split(', ')[1];
      if (p1.split(' - ')[1] === monthToString(date.getMonth())) {
        lastPoissons += poissonsN[i].nom + ', ';
      }
      if (p2.split(' - ')[1]) {
        if (p1 !== p2 && p2.split(' - ')[1] === monthToString(date.getMonth())) {
          lastPoissons += poissonsN[i].nom + ', ';
        }
      } else {
        if (p2 === monthToString(date.getMonth())) {
          lastPoissons += poissonsN[i].nom + ', ';
        }
      }
    } else if (poissonsN[i].période.split(' - ')[1] === monthToString(date.getMonth())) {
      lastPoissons += poissonsN[i].nom + ', ';
    }
  }
  lastPoissons = lastPoissons.substring(0, lastPoissons.length - 2);
  return lastPoissons + '\n';
}

function premierMoisInsectes() {
  var date = new Date();
  var lastInsectes = "";
  for (i = 0; i < insectesN.length; i++) {
    if (insectesN[i].période.split(', ')[1]) {
      var p1 = insectesN[i].période.split(', ')[0];
      var p2 = insectesN[i].période.split(', ')[1];
      if (p1.split(' - ')[0] === monthToString(date.getMonth())) {
        lastInsectes += insectesN[i].nom + ', ';
      }
      if (p2.split(' - ')[0]) {
        if (p1 !== p2 && p2.split(' - ')[0] === monthToString(date.getMonth())) {
          lastInsectes += insectesN[i].nom + ', ';
        }
      } else {
        if (p2 === monthToString(date.getMonth())) {
          lastInsectes += insectesN[i].nom + ', ';
        }
      }
    } else if (insectesN[i].période.split(' - ')[0] === monthToString(date.getMonth())) {
      lastInsectes += insectesN[i].nom + ', ';
    }
  }
  lastInsectes = lastInsectes.substring(0, lastInsectes.length - 2);
  return lastInsectes + '\n';
}

function premierMoisPoissons() {
  var date = new Date();
  var lastPoissons = "";
  for (i = 0; i < poissonsN.length; i++) {
    if (poissonsN[i].période.split(', ')[1]) {
      var p1 = poissonsN[i].période.split(', ')[0];
      var p2 = poissonsN[i].période.split(', ')[1];
      if (p1.split(' - ')[0] === monthToString(date.getMonth())) {
        lastPoissons += poissonsN[i].nom + ', ';
      }
      if (p2.split(' - ')[0]) {
        if (p1 !== p2 && p2.split(' - ')[0] === monthToString(date.getMonth())) {
          lastPoissons += poissonsN[i].nom + ', ';
        }
      } else {
        if (p2 === monthToString(date.getMonth())) {
          lastPoissons += poissonsN[i].nom + ', ';
        }
      }
    } else if (poissonsN[i].période.split(' - ')[0] === monthToString(date.getMonth())) {
      lastPoissons += poissonsN[i].nom + ', ';
    }
  }
  lastPoissons = lastPoissons.substring(0, lastPoissons.length - 2);
  return lastPoissons + '\n';
}
