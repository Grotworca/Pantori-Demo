'use strict';
{
const copy={
 pl:{titles:['Owoce i trasa','Wejście do lochu','Łączenie klocków','Kolorowe duchy','Dźwignia i kolce','Zbierz wszystkie diamenty','Albo pozostaw wszystkie','Obracanie','Odbijanie'],tasks:[
 'Ułóż trasę wędrówki po lochu i zbierz wszystkie owoce. Przeciągnij czerwony klocek tak, aby zakryć oba owoce, i puść go.',
 'Trasa musi prowadzić do krawędzi mapy: co najmniej jeden segment klocka musi dotykać jej bokiem. Zakryj owoc i połącz trasę z krawędzią.',
 'Użyj obu klocków, zbierz owoce i połącz klocki jednym wspólnym bokiem. Dwa klocki nie mogą stykać się kilkoma bokami, a jeden segment nie może dotykać dwóch różnych klocków.',
 'Zakryj oba duchy: czerwonego czerwonym klockiem, niebieskiego niebieskim. Połącz klocki w trasę i zbierz owoce.',
 'Zakryj dźwignię, aby schować kolce. Użyj obu klocków, zbierz owoce i połącz je w trasę; zakryte kolce wymagają zakrytej dźwigni.',
 'Diamenty można zakryć wszystkie albo pozostawić wszystkie odkryte. W tym zadaniu użyj obu klocków i zbierz oba diamenty oraz owoce.',
 'Teraz przećwicz drugą możliwość: zbierz owoce, ale nie zakrywaj żadnego diamentu. Użyj czerwonego klocka.',
 'Wybierz klocek i użyj przycisku obrotu ↻. Ułóż go poziomo tak, aby zakrył oba owoce.',
 'Wybierz niebieski klocek i użyj odbicia ⇆. Dopasuj go do jasnego obrysu, zakrywając owoce.'
 ],success:'Świetnie! Zadanie rozwiązane.',try:'Ułóż klocki zgodnie z zadaniem.',reset:'Ponów zadanie',drag:'Przeciągnij klocek na mapę i puść, aby go ułożyć. Możesz też wybrać go kliknięciem i wskazać pole.',touch:'Przeciągnij klocek na mapę i puść, aby go ułożyć. Możesz też dotknąć klocka, a następnie pola.',rotate:'Obracaj przyciskiem ↻ lub spacją / PPM. Odbijaj przyciskiem ⇆ lub F.',rotateTouch:'Obracaj przyciskiem ↻, odbijaj przyciskiem ⇆.'},
 en:{titles:['Fruit and paths','Entering the dungeon','Connecting pieces','Coloured ghosts','Lever and spikes','Collect every diamond','Or leave them all','Rotating','Flipping'],tasks:[
 'Build a path through the dungeon and collect every fruit. Drag the red piece over both fruits and release it.',
 'Your path must reach the map edge: at least one segment must share a side with the boundary. Cover the fruit and connect your path to an edge.',
 'Use both pieces, collect the fruits and connect the pieces along exactly one shared side. Two pieces cannot share multiple sides, and one segment cannot touch two other pieces.',
 'Cover both ghosts: red with red and blue with blue. Connect the pieces into a path and collect the fruits.',
 'Cover the lever to retract the spikes. Use both pieces, collect the fruits and connect the path; covered spikes require a covered lever.',
 'Cover either all diamonds or none of them. For this exercise, use both pieces and collect both diamonds and all fruits.',
 'Try the other option: collect the fruits without covering any diamonds. Use the red piece.',
 'Select the piece and use the rotate button ↻. Place it horizontally to cover both fruits.',
 'Select the blue piece and flip it with ⇆. Fit it into the pale outline and cover the fruits.'
 ],success:'Great! Exercise completed.',try:'Place the pieces to complete the task.',reset:'Try again',drag:'Drag a piece onto the map and release to place it. You can also click a piece, then a cell.',touch:'Drag a piece onto the map and release to place it. You can also tap a piece, then a cell.',rotate:'Rotate with ↻, Space or right-click. Flip with ⇆ or F.',rotateTouch:'Rotate with ↻ and flip with ⇆.'},
 de:{titles:['Früchte und Wege','Eingang zum Verlies','Teile verbinden','Farbige Geister','Hebel und Stacheln','Alle Diamanten sammeln','Oder alle freilassen','Drehen','Spiegeln'],tasks:[
 'Lege einen Weg durch das Verlies und sammle alle Früchte. Ziehe das rote Teil über beide Früchte und lasse es los.',
 'Der Weg muss den Kartenrand erreichen: Mindestens ein Segment muss mit einer Seite am Rand liegen. Bedecke die Frucht und verbinde den Weg mit dem Rand.',
 'Verwende beide Teile, sammle die Früchte und verbinde die Teile über genau eine gemeinsame Seite. Zwei Teile dürfen sich nicht mehrfach berühren; ein Segment darf nicht zwei andere Teile berühren.',
 'Bedecke beide Geister mit gleichfarbigen Teilen: Rot mit Rot und Blau mit Blau. Verbinde den Weg und sammle die Früchte.',
 'Bedecke den Hebel, um die Stacheln einzufahren. Verwende beide Teile und sammle die Früchte auf einem verbundenen Weg; bedeckte Stacheln benötigen einen bedeckten Hebel.',
 'Bedecke entweder alle Diamanten oder keinen. Verwende hier beide Teile und sammle beide Diamanten und alle Früchte.',
 'Übe die andere Möglichkeit: Sammle die Früchte, ohne einen Diamanten zu bedecken. Verwende das rote Teil.',
 'Wähle das Teil und drehe es mit ↻. Lege es waagerecht über beide Früchte.',
 'Wähle das blaue Teil und spiegle es mit ⇆. Passe es in den hellen Umriss ein und bedecke die Früchte.'
 ],success:'Geschafft! Aufgabe gelöst.',try:'Lege die Teile passend zur Aufgabe.',reset:'Erneut versuchen',drag:'Ziehe ein Teil auf die Karte und lasse es zum Ablegen los. Du kannst auch erst das Teil, dann ein Feld anklicken.',touch:'Ziehe ein Teil auf die Karte und lasse es los. Du kannst auch erst das Teil, dann ein Feld antippen.',rotate:'Drehen: ↻, Leertaste oder Rechtsklick. Spiegeln: ⇆ oder F.',rotateTouch:'Drehen mit ↻, spiegeln mit ⇆.'},
 fr:{titles:['Fruits et chemin','Entrer dans le donjon','Relier les pièces','Fantômes colorés','Levier et pointes','Tous les diamants','Ou aucun diamant','Tourner','Retourner'],tasks:[
 'Tracez un chemin dans le donjon et ramassez tous les fruits. Faites glisser la pièce rouge sur les deux fruits, puis relâchez-la.',
 'Le chemin doit atteindre le bord de la carte : au moins un segment doit longer ce bord par un côté. Recouvrez le fruit et reliez le chemin au bord.',
 'Utilisez les deux pièces, ramassez les fruits et reliez les pièces par un seul côté commun. Deux pièces ne peuvent pas partager plusieurs côtés ; un segment ne peut pas toucher deux autres pièces.',
 'Recouvrez chaque fantôme avec une pièce de sa couleur : rouge ou bleue. Reliez les pièces et ramassez les fruits.',
 'Recouvrez le levier pour rétracter les pointes. Utilisez les deux pièces et ramassez les fruits sur un chemin continu ; les pointes recouvertes nécessitent un levier recouvert.',
 'Recouvrez tous les diamants ou aucun. Ici, utilisez les deux pièces et ramassez les deux diamants ainsi que tous les fruits.',
 'Essayez l’autre possibilité : ramassez les fruits sans recouvrir de diamant. Utilisez la pièce rouge.',
 'Sélectionnez la pièce et tournez-la avec ↻. Placez-la horizontalement sur les deux fruits.',
 'Sélectionnez la pièce bleue et retournez-la avec ⇆. Faites-la correspondre au contour clair et recouvrez les fruits.'
 ],success:'Bravo ! Exercice réussi.',try:'Placez les pièces pour résoudre l’exercice.',reset:'Réessayer',drag:'Faites glisser une pièce sur la carte et relâchez-la pour la poser. Vous pouvez aussi cliquer sur la pièce, puis sur une case.',touch:'Faites glisser une pièce sur la carte et relâchez-la. Vous pouvez aussi toucher la pièce, puis une case.',rotate:'Tourner : ↻, Espace ou clic droit. Retourner : ⇆ ou F.',rotateTouch:'Tournez avec ↻ et retournez avec ⇆.'},
 es:{titles:['Frutas y camino','Entrar en la mazmorra','Conectar piezas','Fantasmas de colores','Palanca y pinchos','Todos los diamantes','O ninguno','Girar','Voltear'],tasks:[
 'Forma un camino por la mazmorra y recoge todas las frutas. Arrastra la pieza roja sobre ambas frutas y suéltala.',
 'El camino debe alcanzar el borde del mapa: al menos un segmento debe tocarlo con un lado. Cubre la fruta y conecta el camino con el borde.',
 'Usa ambas piezas, recoge las frutas y conecta las piezas por un único lado común. Dos piezas no pueden compartir varios lados; un segmento no puede tocar dos piezas distintas.',
 'Cubre cada fantasma con una pieza de su color: rojo o azul. Conecta las piezas y recoge las frutas.',
 'Cubre la palanca para retraer los pinchos. Usa ambas piezas y recoge las frutas formando un camino continuo; si cubres los pinchos, también debes cubrir la palanca.',
 'Cubre todos los diamantes o ninguno. Aquí debes usar ambas piezas y recoger los dos diamantes y todas las frutas.',
 'Prueba la otra opción: recoge las frutas sin cubrir ningún diamante. Usa la pieza roja.',
 'Selecciona la pieza y gírala con ↻. Colócala en horizontal para cubrir ambas frutas.',
 'Selecciona la pieza azul y voltéala con ⇆. Encájala en el contorno claro y cubre las frutas.'
 ],success:'¡Muy bien! Ejercicio resuelto.',try:'Coloca las piezas para resolver el ejercicio.',reset:'Reintentar',drag:'Arrastra una pieza al mapa y suéltala para colocarla. También puedes hacer clic en una pieza y luego en una casilla.',touch:'Arrastra una pieza al mapa y suéltala. También puedes tocar una pieza y luego una casilla.',rotate:'Girar: ↻, Espacio o clic derecho. Voltear: ⇆ o F.',rotateTouch:'Gira con ↻ y voltea con ⇆.'},
 it:{titles:['Frutti e percorso','Entrare nel dungeon','Collegare i pezzi','Fantasmi colorati','Leva e spuntoni','Tutti i diamanti','Oppure nessuno','Ruotare','Ribaltare'],tasks:[
 'Crea un percorso nel dungeon e raccogli tutti i frutti. Trascina il pezzo rosso sui due frutti e rilascialo.',
 'Il percorso deve raggiungere il bordo della mappa: almeno un segmento deve toccarlo con un lato. Copri il frutto e collega il percorso al bordo.',
 'Usa entrambi i pezzi, raccogli i frutti e collega i pezzi lungo un solo lato comune. Due pezzi non possono condividere più lati; un segmento non può toccare due pezzi diversi.',
 'Copri ogni fantasma con un pezzo del suo colore: rosso o blu. Collega i pezzi e raccogli i frutti.',
 'Copri la leva per far rientrare gli spuntoni. Usa entrambi i pezzi e raccogli i frutti lungo un percorso continuo; gli spuntoni coperti richiedono che anche la leva sia coperta.',
 'Copri tutti i diamanti oppure nessuno. Qui usa entrambi i pezzi e raccogli i due diamanti e tutti i frutti.',
 'Prova l’altra possibilità: raccogli i frutti senza coprire alcun diamante. Usa il pezzo rosso.',
 'Seleziona il pezzo e ruotalo con ↻. Posizionalo in orizzontale per coprire entrambi i frutti.',
 'Seleziona il pezzo blu e ribaltalo con ⇆. Inseriscilo nella sagoma chiara e copri i frutti.'
 ],success:'Ottimo! Esercizio completato.',try:'Posiziona i pezzi per risolvere l’esercizio.',reset:'Riprova',drag:'Trascina un pezzo sulla mappa e rilascialo per posizionarlo. Puoi anche fare clic sul pezzo e poi su una casella.',touch:'Trascina un pezzo sulla mappa e rilascialo. Puoi anche toccare il pezzo e poi una casella.',rotate:'Ruota con ↻, Spazio o clic destro. Ribalta con ⇆ o F.',rotateTouch:'Ruota con ↻ e ribalta con ⇆.'}
};
const keys=['fruit','edge','contact','ghost','spikes','diamonds','diamondsNone','rotate','flip'];
for(const [lang,c] of Object.entries(copy)){
 const d=PANTORI_I18N[lang];keys.forEach((key,i)=>{d['lessonTitle_'+key]=c.titles[i];d['lesson_'+key]=c.tasks[i]});
 Object.assign(d,{lessonSuccess:c.success,lessonTry:c.try,lessonReset:c.reset,selectHelp:c.drag,selectHelpMouse:c.drag,selectHelpTouch:c.touch,anchorHelp:c.drag,anchorHelpMouse:c.drag,anchorHelpTouch:c.touch,rotateHelpMouse:c.rotate,rotateHelpTouch:c.rotateTouch,guideControlsMouse:c.drag,guideControlsTouch:c.touch,startMsgMouse:c.drag,startMsgTouch:c.touch});
}
}
