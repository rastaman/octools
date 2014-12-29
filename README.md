# OcTools - Online Cloud Tools

## Overview

A small utility to get informations on nodes on Online Cloud via the API they provide.

## Help

  Usage: octools \[options\] \[command\]

  Commands:

    tokens                   list tokens
    install <token>          install one or more tokens in the store
    remove <token>           remove one token from the store
    refresh                  refresh org and servers for all the tokens)
    generate <scope> <type>  generate for the given scope ("all" or a name) and type ("ansible" or "dns")
    get <scope> [type]       get the infos for the given scope ("all" or a name) and type ("org" or "server")

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -s, --store <store>  use the specified store
    -v, --verbose        verbose mode

