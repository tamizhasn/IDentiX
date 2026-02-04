import "hardhat/types/runtime";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    viem: typeof import("@nomicfoundation/hardhat-toolbox-viem").viem;
  }
}
