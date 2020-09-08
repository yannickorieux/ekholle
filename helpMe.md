# Commandes utiles

## lancement en mode debug
DEBUG=nodeColles:* npm start

## compilation webpack (production)
node_modules/.bin/webpack --mode production

## compilation scss
npm run scss


## restore
Pour restaurer la table bergson_structures par ex., on se place dans le répertoire adéquat et on exécute la commande :

 mongorestore -u ekholle -d dbEKholle -c bergson_structures dbEKholle/bergson_structures.bson

 A l'invite de commande donner le mot de passe de la base de donnees


 ## Sur le serveur

 ### pm2

 se placer dans le dossier /var/www/ekholle et se connecter en  root

 pm2 status
 pm2 stop(start) 0


 # git
 git status


### commit des modifications :
 git commit -a

### pousser le commit sur git
 git push ekholle master

# certificats

certbot-auto en root (sudo su)
permet de régénérer tous les certifs
Select the appropriate number [1-2] then [enter] (press 'c' to cancel): 2
Added an HTTP->HTTPS rewrite in addition to other RewriteRules; you may wish to check for overall consistency.
Redirecting vhost in /etc/apache2/sites-enabled/ekholle.conf to ssl vhost in /etc/apache2/sites-enabled/ekholle.conf
