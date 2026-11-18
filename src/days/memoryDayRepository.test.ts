import { describeDayRepositoryContract } from "./dayRepositoryContract";
import { createMemoryDayRepository } from "./memoryDayRepository";

describeDayRepositoryContract("memory", () => createMemoryDayRepository());
