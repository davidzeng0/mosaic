cmake_minimum_required(VERSION 3.16)
project(mosaic)

execute_process(COMMAND npx protobuf_ts_root OUTPUT_VARIABLE PROTOBUF_TS_ROOT)
set(PROTOC_ARGS -I ${PROTOBUF_TS_ROOT}/include)
list(APPEND CMAKE_MODULE_PATH ${PROTOBUF_TS_ROOT}/cmake)

include(compile)