using Discord;
using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cardinal.Core
{
    internal class Logger
    {
        private static void WriteLog(string message, string level)
        {
            var stack = new StackFrame(2);
            Console.WriteLine(String.Format("[{0}] {1}> {2}", level, System.DateTime.Now.ToString("hh.mm.ss tt"), message));
        }

        public static Task Discord(LogMessage message)
        {
            Console.WriteLine(String.Format("[{0}] {1}> {2}","System", System.DateTime.Now.ToString("hh:mm:ss tt"), message));
            return Task.CompletedTask;
        }

        public static void Log(string message)
        {
            WriteLog(message, "INFO");
        }

        public static void Warn(string message)
        {
            WriteLog(message, "WARN");
        }

        public static void Error(string message)
        {
            WriteLog(message, "ERROR");
        }
    }
}
