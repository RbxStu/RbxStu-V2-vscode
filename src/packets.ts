import * as definitions from "./packet_definitions";

export namespace Packets {
    export function CreateExecutionDataModelPacket(newDataModel: string): definitions.SetExecutionDataModelPacket {
        let flag: definitions.SetExecutionDataModelPacketFlags = 0x0;
        switch (newDataModel) {
            case "Edit":
                flag = definitions.SetExecutionDataModelPacketFlags.Edit;
                break;
            case "Client":
                flag = definitions.SetExecutionDataModelPacketFlags.Client;
                break;
            case "Server":
                flag = definitions.SetExecutionDataModelPacketFlags.Server;
                break;
            case "Standalone":
                flag = definitions.SetExecutionDataModelPacketFlags.Standalone;
                break;
        }

        return {
            packet_id: definitions.PacketIdentifier.SetExecutionDataModelPacket,
            packet_flags: flag
        };
    }

    export function CreateExecutePacket(luauCode: string, guid: string): definitions.ScheduleLuauPacket {
        return {
            packet_id: definitions.PacketIdentifier.ScheduleLuauPacket,
            packet_flags: 0x0,
            luau_code: luauCode,
            _id: guid
        };
    }

    export function CreateBlockFunctionPacket(functionName: string, isBlocked: boolean): definitions.SetFunctionBlockStatePacket {
        return {
            packet_id: definitions.PacketIdentifier.SetFunctionBlockStatePacket,
            packet_flags: isBlocked ? definitions.SetFunctionBlockStatePacketFlags.Block : definitions.SetFunctionBlockStatePacketFlags.Allow,
            function_name: functionName
        };
    }

    export function CreateSetSafeModePacket(enableSafeMode: boolean): definitions.SetSafeModePacket {
        return {
            packet_id: definitions.PacketIdentifier.SetSafeModePacket,
            packet_flags: 0,
            enable_safe_mode: enableSafeMode,
        };
    }

    export function CreateSetNativeCodeGenPacket(enableCodeGen: boolean): definitions.SetNativeCodeGenPacket {
        return {
            packet_id: definitions.PacketIdentifier.SetNativeCodeGenPacket,
            packet_flags: 0,
            enable_native_codegen: enableCodeGen,
        };
    }

    export function CreateHttpConfigurationPacket(newHardwareId: string | undefined, newHeader: string | undefined): definitions.HttpConfigurationPacket {
        return {
            packet_id: definitions.PacketIdentifier.HttpConfigurationPacket,
            packet_flags: 0,
            new_http_fingerprint: typeof newHeader === "undefined" ? "" : newHeader,
            new_hwid: typeof newHardwareId === "undefined" ? "" : newHardwareId,
        };
    }
};