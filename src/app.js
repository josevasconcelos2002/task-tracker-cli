import fs from 'fs';
import os from "os";
import path from "path";

const homeDir = os.homedir();
const filePath = path.join(homeDir, "task-tracker-cli", "data", "tasks.json");
let lastId = 0;

let data = {
    tasks: {
        todo: [],
        "in-progress": [],
        done: []
    }
};

async function main() {
    const args = process.argv.slice(2);

    if (args.length == 0) {
        console.log("0 arguments provided!");
        help();
        return;
    }

    try {
        if (fs.existsSync(filePath)) {
            console.log(filePath + " file already exists!");
            const content = fs.readFileSync(filePath, "utf8").trim();

            if (content.length > 0) {
                data = JSON.parse(content);
                lastId = Math.max(
                    0,
                    ...data.tasks["todo"].map(t => t.id),
                    ...data.tasks["in-progress"].map(t => t.id),
                    ...data.tasks["done"].map(t => t.id)
                );
            }
        } else {
            console.log("Creating tasks.json file ...");
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Erro ao ler ficheiro:", err);
        return;
    }

    const operationType = args[0];

    switch (operationType) {
        case "add":
            if (args.length != 2) {
                console.log("Missing Task <description>!");
                break;
            }
            addTask(args[1]);
            break;

        case "delete":
            if (args.length != 2) {
                console.log("Missing Task <id>!");
                break;
            }
            deleteTask(args[1]);
            break;

        case "update":
            if (args.length != 3) {
                console.log("Missing Task <id> and <newDescription>!");
                break;
            }
            const id = Number(args[1]);
            const newDescription = args[2];
            updateTask(id, newDescription);
            break;

        case "list":
            if (args.length == 1)
                listAllTasks();
            else if (args.length == 2) {
                const type = args[1];
                switch (type) {
                    case "done":
                        listTasksByStatus(type);
                        break;

                    case "todo":
                        listTasksByStatus(type);
                        break;

                    case "in-progress":
                        listTasksByStatus(type);
                        break;

                    default:
                        console.log("Available list options: done | todo | in-progress");
                        break;
                }

            }
            break;

        case "mark-in-progress":
            if (args.length != 2) {
                console.log("Missing Task <id>!");
                break;
            }
            markInProgress(args[1]);
            break;

        case "mark-done":
            if (args.length != 2) {
                console.log("Missing Task <id>!");
                break;
            }
            markDone(args[1]);
            break;

        case "help":
            help();
            break;

        default:
            break;

    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log("tasks.json saved!");
}



function listTasksByStatus(status) {
    const tasks = data.tasks[status];
    if (!tasks.length) {
        console.log(`${status} tasks array is empty!`);
        return;
    }
    console.log(`${status.toUpperCase()} Tasks:`);
    for (const task of tasks) listTask(task);
}

function listAllTasks() {
    console.log("Tasks:");
    listTasksByStatus("todo");
    listTasksByStatus("in-progress");
    listTasksByStatus("done");
}

function listTask(task) {
    console.log("\nId: " + task.id + "\nDescription: " + task.description + "\nStatus: " + task.status + "\nCreatedAt: " + task.createdAt + "\nUpdatedAt: " + task.updatedAt + "\n\n");
}


function addTask(description) {

    const now = new Date().toISOString();
    lastId++;

    const newObject = {
        id: lastId,
        description: description,
        status: "todo",
        createdAt: now,
        updatedAt: now
    };

    data.tasks.todo.push(newObject);
    console.log("Task: " + newObject.id + " -> " + newObject.description + " successfully added!");
}

function deleteTask(id) {

    for (const status of ["todo", "in-progress", "done"]) {
        const previousLength = data.tasks[status].length;
        data.tasks[status] = data.tasks[status].filter((entry) => {
            if (entry.id != id)
                return entry;
        });
        const newLength = data.tasks[status].length;

        if (newLength == previousLength) {
            console.log("Task " + id + " doesnt exist in " + status);
        } else {
            console.log("Task " + id + " deleted in " + status);
        }

    }
}

function updateTask(id, newDescription) {
    for (const status of ["todo", "in-progress", "done"]) {
        data.tasks[status] = data.tasks[status].map((entry) => {
            if (entry.id === id) {
                entry = { ...entry, description: newDescription, updatedAt: new Date().toISOString() };
                console.log("Task " + id + " from " + status + " description's updated to " + entry.description);
            }
            return entry;
        });

    }
}


function markInProgress(id) {
    id = Number(id);
    let taskToMove = null;
    for (const status of ["todo", "done"]) {
        const index = data.tasks[status].findIndex(t => t.id === id);
        if (index !== -1) {
            taskToMove = { ...data.tasks[status][index] };

            taskToMove.updatedAt = new Date().toISOString();
            taskToMove.status = "in-progress";

            data.tasks[status].splice(index, 1);
        }
    }
    
    if(taskToMove)
        data.tasks["in-progress"].push(taskToMove);
    else
        console.log("Task " + id + " couldn't be found.");
}

function markDone(id) {
    id = Number(id);
    let taskToMove = null;
    for (const status of ["todo", "in-progress"]) {
        const index = data.tasks[status].findIndex(t => t.id === id);
        if (index !== -1) {
            taskToMove = { ...data.tasks[status][index] };

            taskToMove.updatedAt = new Date().toISOString();
            taskToMove.status = "done";

            data.tasks[status].splice(index, 1);
        }
    }
    
    if(taskToMove)
        data.tasks["done"].push(taskToMove);
    else
        console.log("Task " + id + " couldn't be found.");
}


function help() {
    const addHelp = "Add feature:  add <description>\n\n";
    const updateHelp = "Update feature:  update <id> <newDescription>\n\n";
    const deleteHelp = "Delete feature:  delete <id>\n\n";
    const markInProgressHelp = "Mark in progress feature:  mark-in-progress <id>\n\n";
    const markDoneHelp = "Mark as done feature:  mark-done <id>\n\n";
    const listHelp = "List feature:  list <type>\n<type>: done | todo | in-progress\n";
    console.log("\nTask Tracker CLI Help:\n\n" + addHelp + updateHelp + deleteHelp + markInProgressHelp + markDoneHelp + listHelp);
}

main();