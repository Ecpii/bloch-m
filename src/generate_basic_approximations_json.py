"""
Prints in JSON of all the basic aproximations used by qiskit's default configuration.
"""

from qiskit.synthesis.discrete_basis.generate_basis_approximations import (
    generate_basic_approximations,
)

whitespace_table = str.maketrans("a", "a", " \t\r\n\v")


def remove_whitespace(string):
    return string.translate(whitespace_table)


def format_gateseq(gateseq):
    gate_names = clean_gates(gateseq.gates)
    gate_matrix = clean_matrix(gateseq.product)
    phase = gateseq.global_phase
    return f'{{"names":{gate_names},"matrix":{gate_matrix},"phase":{phase}}}'


def clean_gates(gates):
    return remove_whitespace(
        str([gate.name for gate in gates]).replace("'", '"')
    )


def clean_matrix(matrix):
    matrix = remove_whitespace(repr(matrix)[6:-1])
    matrix = matrix.replace(".,", ",")
    matrix = matrix.replace(".]", "]")
    matrix = matrix.replace(".00000000e+00", "")
    return matrix


res = generate_basic_approximations(["h", "t", "tdg"], 10)
print("[", end="")
for gateseq in res[:-1]:
    print(
        format_gateseq(gateseq),
        end=",",
    )

gateseq = res[-1]
print(format_gateseq(gateseq), end="")
print("]", end="")
