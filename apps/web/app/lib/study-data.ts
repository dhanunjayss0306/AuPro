/**
 * AuPro Study Portal data: 2nd year, 1st semester (2-1 SEM) preparation.
 * OS only for now. Other subjects are listed as coming soon.
 *
 * Content is grounded in the real AU papers (2025, 2024, 2023, 2022 CSE):
 * see the OS lesson-wise plan and the per-lesson PYQ analysis. Nothing here
 * is invented: every question below was asked in the paper named.
 * The Drive folder holds the notes and papers for all subjects.
 */

import { UniversityVectorDatabase, type QAEntry } from './vector_search.ts';

export const STUDY_DRIVE_URL =
  'https://drive.google.com/drive/folders/10XfL3TjQ5CQL7oqQMEHO-aaa3TrpGP_Z';

export interface StudyTopic {
  name: string;
  expl: string;
}

export interface StudyQuestion {
  text: string;
  paper: string;
  year: string;
  marks: string;
}

export interface StudyUnit {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  priorityNote: string;
  topics: StudyTopic[];
  questions: StudyQuestion[];
}

export interface StudySubject {
  id: string;
  code: string;
  title: string;
  comingSoon: boolean;
  examNote: string;
  units: StudyUnit[];
}

export const studySubjects: StudySubject[] = [
  {
    id: 'os',
    code: 'AI2104',
    title: 'Operating Systems',
    comingSoon: false,
    examNote: '3 hours, 70 marks. Q1 compulsory: 7 short questions x 2 = 14. Then any 4 of Q2-Q8, each 14 marks.',
    units: [
      {
        id: '1',
        title: 'Introduction',
        priority: 'medium',
        priorityNote: '14 marks in 2024, 2023, 2022',
        topics: [
          { name: 'What is an OS', expl: 'Software that manages the hardware and lets programs run.' },
          { name: 'Types of OS', expl: 'Batch, time-sharing, distributed, real-time.' },
          { name: 'OS structures', expl: 'Simple, layered, microkernel. Layered means each layer uses only the layer below it.' },
          { name: 'System calls', expl: 'The way a program asks the OS to do something, like read a file or create a process.' },
          { name: 'OS services and operations', expl: 'The jobs the OS does for programs and users.' },
        ],
        questions: [
          { text: 'Explain the components of OS structure. Explain the simple and layered approach of OS in detail.', paper: 'Q2(a)', year: '2024', marks: '7 marks' },
          { text: 'Explain the five major activities of an OS with respect to process management, and why each is required.', paper: 'Q2(b)', year: '2024', marks: '7 marks' },
          { text: 'What is a system call? Explain the different types of system calls.', paper: 'Q2(a)', year: '2023', marks: '7 marks' },
          { text: 'Explain the different operations performed by the operating system.', paper: 'Q2(b)', year: '2023', marks: '7 marks' },
        ],
      },
      {
        id: '2',
        title: 'Process Management',
        priority: 'high',
        priorityNote: 'Most important',
        topics: [
          { name: 'Process vs program', expl: 'A process is a program in execution.' },
          { name: 'Process states', expl: 'New, ready, running, waiting, terminated.' },
          { name: 'PCB', expl: 'The OS ID card for a process: state, program counter, registers, memory info.' },
          { name: 'FCFS scheduling', expl: 'First come, first served.' },
          { name: 'Round Robin scheduling', expl: 'Each process gets a fixed time slice, then goes to the back of the queue.' },
          { name: 'Waiting time and turnaround time', expl: 'Waiting time is time spent in the ready queue. Turnaround time is total time from submission to completion.' },
          { name: 'IPC', expl: 'How two processes talk to each other. Shared memory means both read and write the same memory.' },
          { name: 'Threads and multithreading models', expl: 'A thread is the smallest unit of work inside a process.' },
        ],
        questions: [
          { text: 'Explain the FCFS CPU scheduling algorithm with an example.', paper: 'Q2(a)', year: '2025', marks: '7 marks' },
          { text: 'Explain the Round Robin CPU scheduling algorithm with an example.', paper: 'Q2(b)', year: '2025', marks: '7 marks' },
          { text: 'What is a process? Explain the various fields of the Process Control Block.', paper: 'Q4(a)', year: '2025', marks: '7 marks' },
          { text: 'What are the advantages of inter-process communication? How does communication take place in a shared-memory environment?', paper: 'Q4(b)', year: '2025', marks: '7 marks' },
          { text: 'Explain the criteria for evaluating CPU scheduling algorithms. Explain the Round Robin scheduling algorithm with a suitable example.', paper: 'Q3', year: '2024', marks: '14 marks' },
        ],
      },
      {
        id: '3',
        title: 'Process Synchronization',
        priority: 'high',
        priorityNote: '14 marks every year',
        topics: [
          { name: 'Critical section problem', expl: 'The part of code where a process touches shared data. Only one process at a time.' },
          { name: 'Three conditions', expl: 'Mutual exclusion, progress, bounded waiting.' },
          { name: "Peterson's solution", expl: 'A software solution for two processes to take turns safely.' },
          { name: 'Semaphores', expl: 'A counter that controls entry. Wait (P) to enter, signal (V) to leave. Binary and counting types.' },
          { name: 'Monitors', expl: 'A high-level tool, like a room with only one key. Only one process inside at a time.' },
          { name: 'Dining Philosophers', expl: 'Five philosophers, five chopsticks. The classic sharing example.' },
          { name: 'Producer-consumer', expl: 'One process makes items, another uses them, through a shared buffer.' },
        ],
        questions: [
          { text: 'What is the Critical Section problem? What conditions must a solution to the critical section problem satisfy?', paper: 'Q5(a)', year: '2025', marks: '7 marks' },
          { text: 'Explain the Dining Philosophers problem and its solution using monitors.', paper: 'Q5(b)', year: '2025', marks: '7 marks' },
          { text: 'What is a monitor? What are its functionalities? How is it different from a semaphore in implementing synchronization?', paper: 'Q5(a)', year: '2024', marks: '7 marks' },
          { text: 'Explain the producer-consumer problem. How does it illustrate the classical problem of synchronization?', paper: 'Q5(b)', year: '2024', marks: '7 marks' },
          { text: 'Counting semaphore initialised to 17. Operations 23P, 18V, 16P, 14V, 1P. Find the final value of the semaphore.', paper: 'Q7', year: 'Feb 2022', marks: '14 marks' },
        ],
      },
      {
        id: '4',
        title: 'Deadlocks',
        priority: 'high',
        priorityNote: 'Most important',
        topics: [
          { name: 'Deadlock', expl: 'Two or more processes waiting forever for each other.' },
          { name: 'Four necessary conditions', expl: 'Mutual exclusion, hold and wait, no preemption, circular wait.' },
          { name: 'Prevention vs avoidance', expl: 'Prevention breaks one of the four conditions. Avoidance checks before allocating.' },
          { name: "Banker's algorithm", expl: 'Before giving resources, the OS checks whether the system will stay in a safe state.' },
          { name: 'Detection', expl: 'Resource allocation graph shows a cycle when a deadlock exists.' },
          { name: 'Recovery', expl: 'Kill a process, or preempt resources, to break the deadlock.' },
        ],
        questions: [
          { text: "How does deadlock avoidance differ from deadlock prevention? Explain the deadlock avoidance algorithm (Banker's algorithm) in detail.", paper: 'Q6', year: '2025', marks: '14 marks' },
          { text: 'In what way are resource allocation graphs used for detection of deadlocks? Write the algorithm.', paper: 'Q6(a)', year: '2024', marks: '7 marks' },
          { text: 'Explain the different techniques to recover the system from deadlock.', paper: 'Q6(b)', year: '2024', marks: '7 marks' },
        ],
      },
      {
        id: '5',
        title: 'Memory Management',
        priority: 'high',
        priorityNote: 'Most important',
        topics: [
          { name: 'Paging', expl: 'Dividing memory into fixed-size pages and frames.' },
          { name: 'Page table', expl: 'The map from a process logical pages to physical frames.' },
          { name: 'Segmentation', expl: 'Dividing memory into variable-size logical parts, like code, data, stack.' },
          { name: 'Virtual memory', expl: 'Running programs bigger than the RAM, using disk as backup.' },
          { name: 'Demand paging', expl: 'A page is loaded into RAM only when the program actually needs it.' },
          { name: 'Page replacement: FIFO, Optimal, LRU', expl: 'FIFO replaces the oldest page. LRU replaces the least recently used. Optimal replaces the page used farthest in the future.' },
          { name: 'Thrashing', expl: 'The system spends more time swapping pages than doing real work.' },
          { name: 'Fragmentation', expl: 'Internal is wasted space inside a block. External is wasted space between blocks.' },
          { name: 'First-fit, best-fit, worst-fit', expl: 'Three ways to choose a free memory block for a process.' },
        ],
        questions: [
          { text: 'Reference string 7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1. Find the number of page faults with FIFO, Optimal and LRU with four free frames, empty initially. Which algorithm gives minimum page faults?', paper: 'Q3', year: '2025', marks: '14 marks' },
          { text: 'What is virtual memory? What are the benefits of the virtual memory technique? What is thrashing? What is the cause of thrashing, how does the system detect thrashing, and what can the system do to eliminate it?', paper: 'Q7', year: '2025', marks: '14 marks' },
          { text: 'Reference string 1,2,3,4,2,1,5,6,2,1,2,3,7,6,3,2,1,2,3,6. Find page faults for optimal page replacement with three frames, initially empty.', paper: 'Q6(a)', year: '2023', marks: '7 marks' },
          { text: 'Explain the concept of demand paging in detail, with neat diagrams.', paper: 'Q7(a)', year: '2024', marks: '7 marks' },
          { text: 'Memory partitions 100KB, 500KB, 200KB, 600KB in order. Show how first-fit, best-fit and worst-fit place processes of 419KB, 317KB, 112KB and 326KB in order.', paper: 'Q7(b)', year: '2024', marks: '7 marks' },
        ],
      },
      {
        id: '6',
        title: 'File Systems and Secondary Storage',
        priority: 'high',
        priorityNote: '14 marks every year',
        topics: [
          { name: 'File access methods', expl: 'Sequential, direct, indexed. How a program reads a file.' },
          { name: 'Directory structures', expl: 'Single-level, two-level, tree. The map that tells where files live.' },
          { name: 'File allocation methods', expl: 'Contiguous, linked, indexed. How file blocks are stored on disk.' },
          { name: 'Free-space management', expl: 'Bit vector and linked list track which disk blocks are free.' },
          { name: 'Disk scheduling: SCAN, C-SCAN', expl: 'SCAN moves the disk head one way serving requests, like a lift. C-SCAN goes one way only, then jumps back to the start.' },
          { name: 'Seek time and rotational latency', expl: 'Seek time is time for the head to reach the track. Rotational latency is time for the disk to rotate to the sector.' },
        ],
        questions: [
          { text: 'Explain single-level, two-level and tree-structured directories.', paper: 'Q8(a)', year: '2025', marks: '7 marks' },
          { text: 'Explain and compare SCAN and C-SCAN disk scheduling algorithms.', paper: 'Q8(b)', year: '2025', marks: '7 marks' },
          { text: 'Explain the various file access methods with suitable examples.', paper: 'Q8(a)', year: '2024', marks: '7 marks' },
          { text: 'Explain the different file allocation methods with a suitable example.', paper: 'Q7(a)', year: '2023', marks: '7 marks' },
          { text: 'Compare and contrast free space management and swap space management.', paper: 'Q7(b)', year: '2023', marks: '7 marks' },
        ],
      },
      {
        id: '7',
        title: 'Case study: Linux, Windows',
        priority: 'low',
        priorityNote: 'Q1 only, revise last',
        topics: [
          { name: 'Linux kernel', expl: 'The core of Linux. It manages processes, memory, files, devices.' },
          { name: 'Windows system components', expl: 'Kernel, executive, device drivers, Win32 subsystem.' },
        ],
        questions: [
          { text: 'Discuss the LINUX Kernel with a neat diagram. Explain the system components of the Windows operating system.', paper: 'Q8', year: '2022', marks: '14 marks' },
        ],
      },
    ],
  },
  {
    id: 'psqt',
    code: 'AI2103',
    title: 'Probability, Statistics and Queuing Theory',
    comingSoon: true,
    examNote: '',
    units: [],
  },
  {
    id: 'coa',
    code: 'AI2102',
    title: 'Computer Organization and Architecture',
    comingSoon: true,
    examNote: '',
    units: [],
  },
  {
    id: 'oop',
    code: 'AI2105',
    title: 'OOP Through Java',
    comingSoon: true,
    examNote: '',
    units: [],
  },
  {
    id: 'dms',
    code: 'AI2101',
    title: 'Discrete Mathematical Structures',
    comingSoon: true,
    examNote: '',
    units: [],
  },
];

/**
 * Searchable bank of real OS questions, for the Study Portal vector search.
 * Same in-app TF-IDF engine as the FAQ chatbot, no external service, no keys.
 * Each answer starts with the paper, question number, unit and marks.
 */
export const studyQuestionBank: QAEntry[] = [
  {
    id: 'os-u1-structures',
    category: 'Operating Systems, Unit 1',
    question: 'Explain the components of OS structure. Explain the simple and layered approach of OS in detail.',
    answer: '2024 paper, Q2(a), Unit 1 Introduction, 7 marks. Know the simple, layered and microkernel structures.',
    keywords: ['structure', 'structures', 'layered', 'simple', 'components', 'microkernel'],
  },
  {
    id: 'os-u1-activities',
    category: 'Operating Systems, Unit 1',
    question: 'Explain the five major activities of an OS with respect to process management, and why each is required.',
    answer: '2024 paper, Q2(b), Unit 1 Introduction, 7 marks.',
    keywords: ['activities', 'process', 'management', 'five', 'major'],
  },
  {
    id: 'os-u1-syscall',
    category: 'Operating Systems, Unit 1',
    question: 'What is a system call? Explain the different types of system calls.',
    answer: '2023 paper, Q2(a), Unit 1 Introduction, 7 marks. Also asked in 2022 CSE.',
    keywords: ['system', 'call', 'calls', 'syscall', 'types'],
  },
  {
    id: 'os-u2-fcfs',
    category: 'Operating Systems, Unit 2',
    question: 'Explain the FCFS CPU scheduling algorithm with an example.',
    answer: '2025 paper, Q2(a), Unit 2 Process Management, 7 marks. FCFS was asked with Round Robin in the same question.',
    keywords: ['fcfs', 'scheduling', 'cpu', 'first', 'come', 'served', 'algorithm', 'example'],
  },
  {
    id: 'os-u2-rr',
    category: 'Operating Systems, Unit 2',
    question: 'Explain the Round Robin CPU scheduling algorithm with an example.',
    answer: '2025 paper, Q2(b), Unit 2 Process Management, 7 marks. Round Robin repeats in 2024 and 2023 too.',
    keywords: ['round', 'robin', 'scheduling', 'cpu', 'time', 'slice', 'quantum'],
  },
  {
    id: 'os-u2-pcb',
    category: 'Operating Systems, Unit 2',
    question: 'What is a process? Explain the various fields of the Process Control Block.',
    answer: '2025 paper, Q4(a), Unit 2 Process Management, 7 marks. PCB repeats in 2023 and 2022 CSE.',
    keywords: ['process', 'pcb', 'control', 'block', 'fields'],
  },
  {
    id: 'os-u2-ipc',
    category: 'Operating Systems, Unit 2',
    question: 'What are the advantages of inter-process communication? How does communication take place in a shared-memory environment?',
    answer: '2025 paper, Q4(b), Unit 2 Process Management, 7 marks. Same wording in 2023.',
    keywords: ['ipc', 'inter', 'process', 'communication', 'shared', 'memory'],
  },
  {
    id: 'os-u2-states',
    category: 'Operating Systems, Unit 2',
    question: 'Explain the various states of a process.',
    answer: '2024 paper, Q1(b), Unit 2 Process Management, 2 marks. Short question, learn the state diagram.',
    keywords: ['states', 'process', 'state', 'ready', 'running', 'waiting'],
  },
  {
    id: 'os-u2-numerical',
    category: 'Operating Systems, Unit 2',
    question: 'Five processes with arrival time and CPU burst time. Calculate the turnaround time and the average waiting time for all processes.',
    answer: '2022 CSE paper, Q3(b), Unit 2 Process Management. The only arrival and burst time numerical in the set.',
    keywords: ['turnaround', 'waiting', 'time', 'average', 'arrival', 'burst', 'numerical', 'calculate'],
  },
  {
    id: 'os-u3-critical',
    category: 'Operating Systems, Unit 3',
    question: 'What is the Critical Section problem? What conditions must a solution to the critical section problem satisfy?',
    answer: '2025 paper, Q5(a), Unit 3 Process Synchronization, 7 marks. The three conditions are mutual exclusion, progress, bounded waiting.',
    keywords: ['critical', 'section', 'conditions', 'mutual', 'exclusion', 'progress', 'bounded', 'waiting'],
  },
  {
    id: 'os-u3-dining',
    category: 'Operating Systems, Unit 3',
    question: 'Explain the Dining Philosophers problem and its solution using monitors.',
    answer: '2025 paper, Q5(b), Unit 3 Process Synchronization, 7 marks. Dining Philosophers repeats in 2023.',
    keywords: ['dining', 'philosophers', 'monitors', 'monitor', 'chopsticks'],
  },
  {
    id: 'os-u3-monitor',
    category: 'Operating Systems, Unit 3',
    question: 'What is a monitor? What are its functionalities? How is it different from a semaphore in implementing synchronization?',
    answer: '2024 paper, Q5(a), Unit 3 Process Synchronization, 7 marks.',
    keywords: ['monitor', 'semaphore', 'synchronization', 'difference'],
  },
  {
    id: 'os-u3-producer',
    category: 'Operating Systems, Unit 3',
    question: 'Explain the producer-consumer problem. How does it illustrate the classical problem of synchronization?',
    answer: '2024 paper, Q5(b), Unit 3 Process Synchronization, 7 marks.',
    keywords: ['producer', 'consumer', 'synchronization', 'classical', 'problem', 'buffer'],
  },
  {
    id: 'os-u3-peterson',
    category: 'Operating Systems, Unit 3',
    question: 'Explain the critical section problem and narrate the solution provided by Peterson.',
    answer: '2022 CSE paper, Q4, Unit 3 Process Synchronization, 7 marks each part.',
    keywords: ['peterson', 'critical', 'section', 'solution'],
  },
  {
    id: 'os-u3-semaphore-num',
    category: 'Operating Systems, Unit 3',
    question: 'Counting semaphore initialised to 17. Operations 23P, 18V, 16P, 14V, 1P. Find the final value of the semaphore.',
    answer: 'Feb 2022 paper, Q7, Unit 3 Process Synchronization. The only semaphore numerical in the set.',
    keywords: ['semaphore', 'counting', 'numerical', 'final', 'value', 'operations'],
  },
  {
    id: 'os-u4-bankers',
    category: 'Operating Systems, Unit 4',
    question: "How does deadlock avoidance differ from deadlock prevention? Explain the deadlock avoidance algorithm (Banker's algorithm) in detail.",
    answer: '2025 paper, Q6, Unit 4 Deadlocks, 14 marks. The fixed Banker question. Learn the safe state and need matrix.',
    keywords: ['banker', 'bankers', 'deadlock', 'avoidance', 'prevention', 'safe', 'state', 'algorithm'],
  },
  {
    id: 'os-u4-rag',
    category: 'Operating Systems, Unit 4',
    question: 'In what way are resource allocation graphs used for detection of deadlocks? Write the algorithm.',
    answer: '2024 paper, Q6(a), Unit 4 Deadlocks, 7 marks.',
    keywords: ['resource', 'allocation', 'graph', 'detection', 'deadlock'],
  },
  {
    id: 'os-u4-recovery',
    category: 'Operating Systems, Unit 4',
    question: 'Explain the different techniques to recover the system from deadlock.',
    answer: '2024 paper, Q6(b), Unit 4 Deadlocks, 7 marks. Recovery repeats in 2023 and 2022 CSE.',
    keywords: ['recovery', 'deadlock', 'recover', 'techniques', 'kill', 'preempt'],
  },
  {
    id: 'os-u4-conditions',
    category: 'Operating Systems, Unit 4',
    question: 'What are the necessary conditions for a deadlock to occur?',
    answer: '2024 paper, Q1(d), Unit 4 Deadlocks, 2 marks. The four conditions: mutual exclusion, hold and wait, no preemption, circular wait.',
    keywords: ['conditions', 'necessary', 'deadlock', 'mutual', 'exclusion', 'hold', 'wait', 'preemption', 'circular'],
  },
  {
    id: 'os-u5-pagefaults',
    category: 'Operating Systems, Unit 5',
    question: 'Reference string 7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1. Find the number of page faults with FIFO, Optimal and LRU with four free frames, empty initially. Which algorithm gives minimum page faults?',
    answer: '2025 paper, Q3, Unit 5 Memory Management, 14 marks. Only two reference strings circulate in the papers, practise both.',
    keywords: ['page', 'faults', 'fifo', 'optimal', 'lru', 'replacement', 'reference', 'string', 'frames'],
  },
  {
    id: 'os-u5-pagefaults2',
    category: 'Operating Systems, Unit 5',
    question: 'Reference string 1,2,3,4,2,1,5,6,2,1,2,3,7,6,3,2,1,2,3,6. Find page faults for optimal page replacement with three frames, initially empty.',
    answer: '2023 paper, Q6(a), Unit 5 Memory Management, 7 marks. The 2024 paper reuses this string with four frames.',
    keywords: ['page', 'faults', 'optimal', 'replacement', 'reference', 'string', 'frames'],
  },
  {
    id: 'os-u5-vm-thrash',
    category: 'Operating Systems, Unit 5',
    question: 'What is virtual memory? What are the benefits of the virtual memory technique? What is thrashing? What is the cause of thrashing, how does the system detect thrashing, and what can the system do to eliminate it?',
    answer: '2025 paper, Q7, Unit 5 Memory Management, 14 marks. Virtual memory and thrashing repeat in 2023, 2022 and 2024.',
    keywords: ['virtual', 'memory', 'thrashing', 'benefits', 'cause', 'detect', 'eliminate'],
  },
  {
    id: 'os-u5-demand',
    category: 'Operating Systems, Unit 5',
    question: 'Explain the concept of demand paging in detail, with neat diagrams.',
    answer: '2024 paper, Q7(a), Unit 5 Memory Management, 7 marks. Page fault procedure is the companion question, 2023 Q6(b).',
    keywords: ['demand', 'paging', 'page', 'fault', 'diagrams'],
  },
  {
    id: 'os-u5-fit',
    category: 'Operating Systems, Unit 5',
    question: 'Memory partitions 100KB, 500KB, 200KB, 600KB in order. Show how first-fit, best-fit and worst-fit place processes of 419KB, 317KB, 112KB and 326KB in order.',
    answer: '2024 paper, Q7(b), Unit 5 Memory Management, 7 marks.',
    keywords: ['first', 'fit', 'best', 'worst', 'allocation', 'partitions', 'memory'],
  },
  {
    id: 'os-u5-paging',
    category: 'Operating Systems, Unit 5',
    question: 'What is paging? Explain the paging model of logical and physical memory.',
    answer: '2023 paper, Q8(a), Unit 5 Memory Management, 7 marks. Also a Q1 short question: what is the basic function of paging, 2025.',
    keywords: ['paging', 'page', 'table', 'logical', 'physical', 'memory', 'model'],
  },
  {
    id: 'os-u6-dirs',
    category: 'Operating Systems, Unit 6',
    question: 'Explain single-level, two-level and tree-structured directories.',
    answer: '2025 paper, Q8(a), Unit 6 File Systems, 7 marks.',
    keywords: ['directory', 'directories', 'single', 'level', 'two', 'tree', 'structured'],
  },
  {
    id: 'os-u6-scan',
    category: 'Operating Systems, Unit 6',
    question: 'Explain and compare SCAN and C-SCAN disk scheduling algorithms.',
    answer: '2025 paper, Q8(b), Unit 6 File Systems, 7 marks.',
    keywords: ['scan', 'c-scan', 'disk', 'scheduling', 'algorithm', 'compare'],
  },
  {
    id: 'os-u6-access',
    category: 'Operating Systems, Unit 6',
    question: 'Explain the various file access methods with suitable examples.',
    answer: '2024 paper, Q8(a), Unit 6 File Systems, 7 marks. Access methods also appear as a 2025 Q1 short question.',
    keywords: ['file', 'access', 'methods', 'sequential', 'direct', 'indexed', 'examples'],
  },
  {
    id: 'os-u6-alloc',
    category: 'Operating Systems, Unit 6',
    question: 'Explain the different file allocation methods with a suitable example.',
    answer: '2023 paper, Q7(a), Unit 6 File Systems, 7 marks. Allocation repeats in 2022 CSE.',
    keywords: ['file', 'allocation', 'methods', 'contiguous', 'linked', 'indexed'],
  },
  {
    id: 'os-u6-freespace',
    category: 'Operating Systems, Unit 6',
    question: 'Compare and contrast free space management and swap space management.',
    answer: '2023 paper, Q7(b), Unit 6 File Systems, 7 marks. Bit vector is the 2024 Q1 short question on the same topic.',
    keywords: ['free', 'space', 'management', 'swap', 'bit', 'vector'],
  },
  {
    id: 'os-u6-diskattach',
    category: 'Operating Systems, Unit 6',
    question: 'Explain the various types of disk storage attachments.',
    answer: '2023 paper, Q8(b), Unit 6 File Systems, 7 marks.',
    keywords: ['disk', 'storage', 'attachments', 'attached', 'host'],
  },
  {
    id: 'os-u7-linux',
    category: 'Operating Systems, Unit 7',
    question: 'Discuss the LINUX Kernel with a neat diagram. Explain the system components of the Windows operating system.',
    answer: '2022 CSE paper, Q8, Unit 7 Case study, 14 marks. The ONLY full Unit 7 question in all papers checked. Absent in 2023, 2024 and 2025.',
    keywords: ['linux', 'kernel', 'windows', 'components', 'diagram'],
  },
  {
    id: 'os-weightage',
    category: 'Operating Systems, Weightage',
    question: 'What is the weightage of each unit in Operating Systems? How many marks is each lesson worth?',
    answer: 'Each unit is worth 14 marks if you pick its question, plus 2 marks in Q1 short questions. Units 2, 4 and 5 are the most important: 14 marks every year, with the same numerical types. Units 3 and 6 are also 14 marks every year. Unit 1 had a 14-mark question in 2024, 2023 and 2022, but none in 2025. Unit 7 is the weakest: only one full question in all papers checked, 2022 Q8, and nothing in 2023, 2024 or 2025. Study order: Unit 2, then 5, then 4.',
    keywords: ['weightage', 'weight', 'marks', 'lesson', 'important', 'highest', 'exam', 'priority'],
  },
  {
    id: 'os-most-asked',
    category: 'Operating Systems, Most asked',
    question: 'What are the most asked questions in Operating Systems? Which questions repeat the most? What are the most repeated questions?',
    answer: 'Most repeated questions: Banker algorithm, 2025 Q6 (14 marks). Page faults with FIFO, Optimal and LRU, 2025 Q3 and 2024 Q4. FCFS and Round Robin scheduling, 2025 Q2, 2024 Q3 and 2023 Q3. Process Control Block, 2025 Q4, 2023 Q4 and 2022 Q3. Dining Philosophers, 2025 Q5 and 2023 Q5. Virtual memory and thrashing, 2025 Q7 and 2023. Deadlock recovery, 2024 Q6, 2023 Q5 and 2022 Q5. IPC shared memory, 2025 Q4 and 2023 Q4.',
    keywords: ['most', 'asked', 'repeated', 'repeat', 'highest', 'frequently', 'common', 'important', 'questions'],
  },
  {
    id: 'os-exam-pattern',
    category: 'Operating Systems, Exam pattern',
    question: 'What is the exam pattern for Operating Systems? How many marks is the exam? How many questions do I need to answer?',
    answer: '3 hours, 70 marks. Q1 is compulsory: 7 short questions x 2 marks = 14, covering all units. Then answer any 4 of Q2 to Q8, each 14 marks. You attempt 5 questions total.',
    keywords: ['exam', 'pattern', 'marks', 'total', 'hours', 'questions', 'answer', 'paper', 'structure', 'time'],
  },
  {
    id: 'os-which-unit-first',
    category: 'Operating Systems, Study order',
    question: 'Which unit should I study first? Which is the most important unit in Operating Systems?',
    answer: 'Start with Unit 2 Process Management, then Unit 5 Memory Management, then Unit 4 Deadlocks. Those three are the safest 42 marks. Then Unit 3 and Unit 6. Unit 1 after that. Unit 7 last, only for Q1.',
    keywords: ['first', 'start', 'most', 'important', 'priority', 'order', 'study', 'begin', 'unit'],
  },
  {
    id: 'os-u1-weightage',
    category: 'Operating Systems, Unit 1',
    question: 'What is the weightage of Unit 1 Introduction?',
    answer: 'Unit 1 Introduction is 14 marks in 2024, 2023 and 2022, but no 14-mark question in 2025. Medium priority. It still appears in Q1 short questions every year for 2 marks. Read: OS structures, system calls and OS activities.',
    keywords: ['weightage', 'weight', 'marks', 'worth', 'unit 1', 'chapter 1', 'lesson', 'chapter', 'important'],
  },
  {
    id: 'os-u2-weightage',
    category: 'Operating Systems, Unit 2',
    question: 'What is the weightage of Unit 2 Process Management?',
    answer: 'Unit 2 Process Management is 14 marks every year. Most important. The fixed question types are FCFS and Round Robin scheduling sums, PCB fields, IPC and the process state cycle.',
    keywords: ['weightage', 'weight', 'marks', 'worth', 'unit 2', 'chapter 2', 'lesson', 'chapter', 'important'],
  },
  {
    id: 'os-u3-weightage',
    category: 'Operating Systems, Unit 3',
    question: 'What is the weightage of Unit 3 Process Synchronization?',
    answer: 'Unit 3 Process Synchronization is 14 marks every year. Critical section conditions, Dining Philosophers with monitors, monitor vs semaphore, producer-consumer, Peterson solution and the counting semaphore numerical.',
    keywords: ['weightage', 'weight', 'marks', 'worth', 'unit 3', 'chapter 3', 'lesson', 'chapter', 'important'],
  },
  {
    id: 'os-u4-weightage',
    category: 'Operating Systems, Unit 4',
    question: 'What is the weightage of Unit 4 Deadlocks?',
    answer: 'Unit 4 Deadlocks is 14 marks every year. Most important. Banker algorithm is the fixed question. Also RAG detection, recovery and the four deadlock conditions.',
    keywords: ['weightage', 'weight', 'marks', 'worth', 'unit 4', 'chapter 4', 'lesson', 'chapter', 'important'],
  },
  {
    id: 'os-u5-weightage',
    category: 'Operating Systems, Unit 5',
    question: 'What is the weightage of Unit 5 Memory Management?',
    answer: 'Unit 5 Memory Management is 14 marks every year. Most important. Page fault sums with FIFO, Optimal and LRU, virtual memory and thrashing, demand paging and first, best and worst fit.',
    keywords: ['weightage', 'weight', 'marks', 'worth', 'unit 5', 'chapter 5', 'lesson', 'chapter', 'important'],
  },
  {
    id: 'os-u6-weightage',
    category: 'Operating Systems, Unit 6',
    question: 'What is the weightage of Unit 6 File Systems and Secondary Storage?',
    answer: 'Unit 6 File Systems and Secondary Storage is 14 marks every year. Single, two-level and tree directories, SCAN vs C-SCAN, file access methods and allocation methods.',
    keywords: ['weightage', 'weight', 'marks', 'worth', 'unit 6', 'chapter 6', 'lesson', 'chapter', 'important'],
  },
  {
    id: 'os-u7-weightage',
    category: 'Operating Systems, Unit 7',
    question: 'What is the weightage of Unit 7 Case study Linux and Windows?',
    answer: 'Unit 7 Case study Linux and Windows is the weakest. Only one full 14-mark question in all papers checked, 2022 Q8, and nothing in 2023, 2024 or 2025. Revise only for Q1 short questions.',
    keywords: ['weightage', 'weight', 'marks', 'worth', 'unit 7', 'chapter 7', 'lesson', 'chapter', 'important'],
  },
  {
    id: 'os-must-read',
    category: 'Operating Systems, Must read',
    question: 'What are the questions I have to read? Which questions should I read for the exam? What should I read?',
    answer: 'Read these first, in this order: 1. Banker algorithm, 2025 Q6. 2. Page faults with FIFO, Optimal and LRU, 2025 Q3. 3. FCFS and Round Robin scheduling, 2025 Q2. 4. PCB fields, 2025 Q4. 5. Dining Philosophers, 2025 Q5. 6. Virtual memory and thrashing, 2025 Q7. 7. Deadlock conditions and recovery, 2024 Q6. 8. IPC shared memory, 2025 Q4. 9. Critical section conditions, 2025 Q5. 10. Directory structures and SCAN vs C-SCAN, 2025 Q8. These ten cover Units 2, 3, 4, 5 and 6, the 14-mark questions from the latest paper.',
    keywords: ['read', 'must', 'questions', 'cover', 'study', 'important', 'prepare', 'revise', 'list', 'have'],
  },
];

/** In-memory vector search over the study questions. Same engine as the FAQ chatbot. */
export const studyVectorDB = new UniversityVectorDatabase(studyQuestionBank);
