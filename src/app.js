import fs from 'fs';
import os from "os";
import path from "path";

const homeDir = os.homedir();
const filePath = path.join(homeDir, "task-tracker-cli", "data", "tasks.json");
let lastId = 0;

async function main(){
    const args = process.argv.slice(2);

    if(args.length == 0){
        console.log("0 arguments provided!");
        help();
    }

    fs.stat(filePath, (err, stat) => {

        if(!err){
            console.log( filePath + " file already exists!");
        }

        else if(err.code === 'ENOENT'){
            console.log("Creating tasks.json file ...");
            const fd = fs.openSync(filePath, 'w');
            fs.closeSync(fd);
        }
    })

    const operationType = args[0];
    switch(operationType){
        case "add":
            if(args.length != 2){
                console.log("Missing Task description!!");
                break;
            }
            addTask(args[1]);
            break;
        
        
    }
}

function addTask(description){

    let data = {
        tasks: {
        todo: [],
        "in-progress": [],
        done: []
        }
    };

    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8").trim();
        if (content.length > 0) {
        try {
            data = JSON.parse(content);
        } catch (err) {
            console.error("Erro a fazer parsing do JSON:", err);
            return;
        }
        }
    }

    const now = new Date().toISOString();
    lastId++;

    const newObject = {
        id: lastId,
        description,
        status: "todo",
        createdAt: now,
        updatedAt: now
    };

    data.tasks.todo.push(newObject);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}



function help(){
    const addHelp = "Add feature:  add <description>\n\n";
    const updateHelp = "Update feature:  update <id> <newDescription>\n\n";
    const deleteHelp = "Delete feature:  delete <id>\n\n";
    const markInProgressHelp = "Mark in progress feature:  mark-in-progress <id>\n\n";
    const markDoneHelp = "Mark as done feature:  mark-done <id>\n\n";
    const listHelp = "List feature:  list <type>\n<type>: done | todo | in-progress\n";
    console.log("\nTask Tracker CLI Help:\n\n" + addHelp + updateHelp + deleteHelp + markInProgressHelp + markDoneHelp + listHelp);
}

main();