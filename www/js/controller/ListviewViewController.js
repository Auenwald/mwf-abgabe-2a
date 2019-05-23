/**
 * @author Jörn Kreutel
 */
import {mwf} from "../Main.js";
import {entities} from "../Main.js";


export default class ListviewViewController extends mwf.ViewController {

    constructor() {
        super();
        this.resetDatabaseElement = null;

        console.log("ListviewViewController()");

        this.addNewMediaItem = null;

    }

    /*
     * for any view: initialise the view
     */
    async oncreate() {

        // TODO: do databinding, set listeners, initialise the view
        this.addNewMediaItemElement = this.root.querySelector("#addNewMediaItem");
        this.addNewMediaItemElement.onclick = (() => {
            this.createNewItem();
        });



        this.switchStorage = this.root.querySelector("#switchStorage");
        this.switchStorage.onclick = (() => {
            let currentAccess = this.application.currentCRUDScope;
            let showCurrentAccess = document.getElementById('showCurrentAccess');


            (currentAccess == 'local') ? currentAccess = 'remote' : currentAccess = 'local';

            showCurrentAccess.innerHTML = currentAccess.toUpperCase();
            this.application.switchCRUD(currentAccess);
            entities.MediaItem.readAll().then((items) => {
                this.initialiseListview(items);
            });

        });


        entities.MediaItem.readAll().then((items) => {
            this.initialiseListview(items);
        });

        this.resetDatabaseElement = this.root.querySelector("#resetDatabase");


        this.resetDatabaseElement.onclick = (() => {
            if(confirm("Soll die Datenbank wirklich zurückgesetzt werden?")){
                indexedDB.deleteDatabase("mwftutdb");
            }
        });


        // call the superclass once creation is done
        super.oncreate();
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    // bindListItemView(viewid, itemview, item) {
    //     // TODO: implement how attributes of item shall be displayed in itemview
    //
    //     itemview.root.getElementsByTagName("img")[0].src = item.src;
    //     itemview.root.getElementsByTagName("h2")[0].textContent = item.title+item._id;
    //     itemview.root.getElementsByTagName("h3")[0].textContent = item.added;
    //
    // }

    createNewItem() {
        var newItem = new entities.MediaItem("","https://placeimg.com/100/100/city");
        this.showDialog("mediaItemDialog",{
            item: newItem,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    newItem.create().then(() => {
                        this.addToListview(newItem);
                    });
                    this.hideDialog();
                })
            }
        });


    }

    askDelete(item){
        this.showDialog("mediaDeleteMenu", {
            item: item,
            actionBindings: {

                deleteItem: ((event) => {
                    this.deleteItem(item);
                    this.hideDialog();
                }),
                closeDialog: ((event) => {
                    this.hideDialog();
                })
            }
        });
    }

    deleteItem(item) {

        item.delete(() => {
            this.removeFromListview(item._id);
        });

    }
    editItem(item) {
        this.showDialog("mediaItemDialog", {
            item: item,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    item.update().then(() => {
                        this.updateInListview(item._id,item);
                    });
                    this.hideDialog();
                }),/*!!!*/
                deleteItem: ((event) => {
                    this.deleteItem(item);
                    this.hideDialog();
                }),
            }
        });
    }



    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    // onListItemSelected(listitem, listview) {
    //     // TODO: implement how selection of listitem shall be handled
    //     this.nextView("mediaReadview",{item: listitem});
    //
    // }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(option, listitem, listview) {
        // TODO: implement how selection of option for listitem shall be handled
        super.onListItemMenuItemSelected(option, listitem,
            listview);

    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
     */
    bindDialog(dialogid, dialog, item) {
        // call the supertype function
        super.bindDialog(dialogid, dialog, item);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }

    /*
     * for views that initiate transitions to other views
     */
    async onReturnFromSubview(subviewid, returnValue, returnStatus) {
        if (subviewid == "mediaReadview" && returnValue &&
            returnValue.deletedItem) {
            this.removeFromListview(returnValue.deletedItem._id);
        }

    }

}

