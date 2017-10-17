# Foursquare API

### Informazioni generali
Per sfruttare le api di foursquare senza la necessità che l'utente sia autenticato utilizziamo il nostro account "server". Ogni richiesta richiederà quindi dei parametri contenenti le informazioni del nostro utente nel mezzo per accedere all'endpoint. La versione free, senza verifica della carta di credito prevede 1000 richieste al giorno. Per il momento sfrutteremo questa.

### Eseguire la ricerca di un posto
La chiamata viene eseguita, tramite il metodo `GET`, all'indirizzo: `https://api.foursquare.com/v2/venues/search`. I parametri da settare saranno:
* `client_id`: usiamo la variabile `FSQ_CLIENT_ID`
* `client_secret`: usiamo la variabile `FSQ_CLIENT_SECRET`
* `v`: usiamo la variabile `FSQ_VERSION`
* `ll`: latutudine e longitudine separate da virgola (`44.3,37.2`)
* `near`: luogo dove si esegue la ricerca (`Chicago, IL`)
* `query`: oggetto della ricerca (`pizzeria`)
* `categoryId`: id delle possibili categorie, separate da `,` (`4bf58dd8d488d11094, 4bf58dd8d1bd941735`). La lista completa è reperibile [qui](https://developer.foursquare.com/docs/resources/categories)
* `limit`: numero massimo di risultati

*NB*: è necessario impostare per ogni chiamata almeno un uno fra i parametri `ll` e `near`
