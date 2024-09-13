
export enum PacketIdentifier {
    HelloPacket = 0x0,

    SetFastVariablePacket = 0x1,

    SetFunctionBlockStatePacket = 0x2,

    SetNativeCodeGenPacket = 0x3,

    HttpConfigurationPacket = 0x4,

    SetSafeModePacket = 0x5,

    SetExecutionDataModelPacket = 0x6,

    ResponseStatusPacket = 0x7,

    ScheduleLuauPacket = 0x8,

    ScheduleLuauResponsePacket = 0x9,

    SetScriptSourceAccessPacket = 0xA,

    DataModelUpdatePacket = 0xB,
}

export enum DataModelTypes {
    Edit = 0,
    PlayClient = 1,
    PlayServer = 2,
    MainMenuStandalone = 3,
    Null = 4
}

export interface PacketBase<T> {
    packet_id: number,
    packet_flags: T,
}

export interface HelloPacket extends PacketBase<number> {
    is_safe_mode_enabled: boolean,
    is_codegen_enabled: boolean,
    current_execution_datamodel: DataModelTypes,
    http_fingerprint_header: string,
}

export enum ScheduleLuauResponsePacketFlags {
    Failure = 0b0,
    Success = 0b1,
}

export interface ScheduleLuauPacket extends PacketBase<number> {
    luau_code: string,
    _id: string
}

export interface ScheduleLuauResponsePacket extends PacketBase<ScheduleLuauResponsePacketFlags> {
    result: string,
    _id: string
}

export enum SetExecutionDataModelPacketFlags {
    Edit = 0b0,
    Client = 0b1,
    Server = 0b10,
    Standalone = 0b100,
}

export interface SetExecutionDataModelPacket extends PacketBase<SetExecutionDataModelPacketFlags> { }

export enum SetScriptSourceAccessPacketFlags {
    DisallowSourceAccess = 0b0,
    AllowSourceAccess = 0b1,
}

export interface SetScriptSourceAccessPacket extends PacketBase<SetScriptSourceAccessPacketFlags> { }

export interface SetSafeModePacket extends PacketBase<number> {
    enable_safe_mode: boolean
}

export enum SetFunctionBlockStatePacketFlags {
    Block = 0x0,
    Allow = 0x1,
}

export interface SetFunctionBlockStatePacket extends PacketBase<SetFunctionBlockStatePacketFlags> {
    function_name: string,
}

export interface SetSafeModePacket extends PacketBase<number> {
    enable_safe_mode: boolean
}

export interface SetNativeCodeGenPacket extends PacketBase<number> {
    enable_native_codegen: boolean
}

export interface HttpConfigurationPacket extends PacketBase<number> {
    new_http_fingerprint: string | undefined,
    new_hwid: string | undefined
}