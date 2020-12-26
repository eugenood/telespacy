# Telespacy

Just another bot for managing community spaces in Telegram.

## Overview

Telespacy is a Telegram bot for managing community spaces with multiple Telegram groups. It emulates the server/channels setup in Discord and workspace/channels setup in Slack. Here, we call each workspace as *space* and each channel as *group*.

## Installation

Clone this repository.
```
git clone https://github.com/eugenood/telespacy
cd telespacy
```

Install the dependencies.
```
npm install
```

Run the server.
```
BOT_TOKEN=1234567890 npm start
```

## Usage

As mentioned previously, each space can have multiple groups under it. All spaces need to have one base group that manages all other groups. To create a new space, promote Telespacy to admin in the desired based group and run the `/create` command.
```
/create <spacename>
```

Some operations require moderator rights. The user who created the space is automatically made a moderator. To promote a user to a moderator, an existing moderator can run the `/moderator` command.
```
/moderator <userid>
```

To obtain the user ID, any member can run the `/moderator` command without any arguments.
```
/moderator
```

To add a new group into the newly created space, promote Telespacy to admin in the desired group and run the `/add` command as a moderator.
```
/add <spacename>
```

To broadcast a message from the base group to all other groups in the space, run the `/broadcast` command as a moderator.
```
/broadcast <message>
```

To see a list of all groups in the space, any member in the space can run the `/list` command.
```
/list
```

## License

Telespacy is [MIT licensed](https://github.com/eugenood/telespacy/blob/main/LICENSE).
